require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const {
  User,
  Category,
  Subcategory,
  Article,
  Settings,
} = require("./models");

// ============================================================
// DHOORTH — DATABASE SEED
// ============================================================
// This script creates/updates:
//   1. Author account
//   2. Categories
//   3. Subcategories
//   4. Site settings
//   5. Demo article (only if database has no articles)
//
// IMPORTANT:
// ADMIN_EMAIL and ADMIN_PASSWORD should exist in .env
// ============================================================


// ------------------------------------------------------------
// 1. FIXED CATEGORIES
// ------------------------------------------------------------

const categories = [
  "Indian Politics",
  "Global Politics",
  "Technology",
  "Sports",
  "Mysteries",
  "Entertainment",
  "China Section",
  "Finance",
  "Psychology",
  "Medical Science",
  "Space & Astronomy",
  "Anthropology",
  "Archaeology",
  "Genetic Science",
];


// ------------------------------------------------------------
// 2. FIXED SUBCATEGORIES
// ------------------------------------------------------------
// The system remains flexible:
// the Author can add more categories/subcategories later
// through the Admin panel.
// ------------------------------------------------------------

const subcategories = {
  "Global Politics": [
    "US Section",
    "UK Section",
    "Russia Section",
    "Pakistan Section",
  ],

  "Technology": [
    "AI & ML",
    "Infrastructure",
    "Transportation",
    "Automobile",
    "Biotech Advancements",
  ],

  "China Section": [
    "Politics & Policy",
    "Economy",
    "Society & Culture",
    "Science & Technology",
  ],

  "Indian Politics": [
    "National Affairs",
    "States",
    "Elections & Governance",
  ],

  "Space & Astronomy": [
    "Space Launches",
    "Astronomy",
    "Planetary Science",
  ],

  "Finance": [
    "Markets",
    "Economy",
    "Business & Industry",
  ],
};


// ------------------------------------------------------------
// 3. CONNECT TO MONGODB
// ------------------------------------------------------------

async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is missing from the environment variables."
    );
  }

  await mongoose.connect(process.env.MONGO_URI);

  console.log("✓ Connected to MongoDB");
}


// ------------------------------------------------------------
// 4. CREATE / UPDATE AUTHOR
// ------------------------------------------------------------

async function seedAuthor() {
  const email = (
    process.env.ADMIN_USER || "strandedincosmos@gmail.com"
  )
    .trim()
    .toLowerCase();

  const rawPassword = process.env.ADMIN_PASSWORD;

  // Never silently create a known default password.
  if (!rawPassword) {
    throw new Error(
      "ADMIN_PASSWORD is missing from the environment. " +
      "Set a strong password before running the seed script."
    );
  }

  if (rawPassword.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must contain at least 8 characters."
    );
  }

  const password = await bcrypt.hash(rawPassword, 12);

  const author = await User.findOneAndUpdate(
    { email },
    {
      name: "Author",
      slug: "author",
      email,
      password,
      role: "author",
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log(`✓ Author account ready: ${email}`);

  return author;
}


// ------------------------------------------------------------
// 5. CREATE / UPDATE CATEGORIES
// ------------------------------------------------------------

async function seedCategories() {
  const categoryMap = {};

  for (const name of categories) {
    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const category = await Category.findOneAndUpdate(
      { name },
      {
        name,
        slug,
        active: true,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    categoryMap[name] = category;
  }

  console.log(`✓ ${categories.length} categories ready`);

  return categoryMap;
}


// ------------------------------------------------------------
// 6. CREATE / UPDATE SUBCATEGORIES
// ------------------------------------------------------------

async function seedSubcategories(categoryMap) {
  let count = 0;

  for (const parentCategory of Object.keys(subcategories)) {
    const category = categoryMap[parentCategory];

    if (!category) {
      console.warn(
        `⚠ Category "${parentCategory}" not found. Skipping subcategories.`
      );

      continue;
    }

    for (const name of subcategories[parentCategory]) {
      const slug = slugify(
        `${name}-${parentCategory}`,
        {
          lower: true,
          strict: true,
        }
      );

      await Subcategory.findOneAndUpdate(
        { slug },
        {
          name,
          slug,
          category: category._id,
          active: true,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      count++;
    }
  }

  console.log(`✓ ${count} subcategories ready`);
}


// ------------------------------------------------------------
// 7. SITE SETTINGS
// ------------------------------------------------------------
// These are stored in MongoDB so the Author can eventually
// modify them through the Admin Settings page without editing
// source code.
// ------------------------------------------------------------

async function seedSettings() {
  const siteSettings = {
    siteName: "DHOORTH",
    description:
      "Independent publication for news, analysis, research and long-form stories.",

    commentsEnabled: true,

    adsEnabled: true,

    // Author can eventually control these from the CMS.
    socialLinks: {
      twitter: "",
      instagram: "",
      youtube: "",
      linkedin: "",
    },

    contactEmail: "",

    footerText:
      "Independent journalism, analysis, research and long-form stories.",
  };

  await Settings.findOneAndUpdate(
    { key: "site" },
    {
      key: "site",
      value: siteSettings,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log("✓ Site settings ready");
}


// ------------------------------------------------------------
// 8. CREATE DEMO ARTICLE
// ------------------------------------------------------------
// Only creates the demo article if the database currently
// contains ZERO articles.
//
// This prevents re-running seed.js from overwriting real
// articles.
// ------------------------------------------------------------

async function seedDemoArticle(author, categoryMap) {
  const articleCount = await Article.countDocuments();

  if (articleCount > 0) {
    console.log(
      `✓ Existing articles detected (${articleCount}). Demo article skipped.`
    );

    return;
  }

  const technology = categoryMap["Technology"];

  if (!technology) {
    console.warn(
      "⚠ Technology category not found. Demo article skipped."
    );

    return;
  }

  await Article.create({
    headline: "A Modular Editorial Platform — Demo Story",

    slug: "modular-editorial-platform-demo",

    subtitle:
      "DEMO CONTENT — replace before publication",

    summary:
      "Sample article showing the publication architecture.",

    articleType: "DEEP DIVE",

    author: author._id,

    place: "",

    categories: [
      technology._id,
    ],

    subcategories: [],

    tags: [
      "demo",
      "technology",
    ],

    content: [
      {
        type: "paragraph",

        text:
          "This is demonstration content. Replace it with verified reporting, analysis or research before publishing.",
      },

      {
        type: "heading",

        heading: "Build stories from blocks",

        level: 2,
      },

      {
        type: "paragraph",

        text:
          "The author can add paragraphs, headings, images, videos, documents, quotes, lists and highlights without changing source code.",
      },
    ],

    sources: [],

    status: "published",

    publishedAt: new Date(),

    featured: true,

    trending: true,

    breaking: false,

    commentsEnabled: true,

    views: 0,
  });

  console.log("✓ Demo article created");
}


// ------------------------------------------------------------
// 9. MAIN SEED FUNCTION
// ------------------------------------------------------------

async function seed() {
  try {
    console.log("");
    console.log("========================================");
    console.log("       DHOORTH DATABASE SEED");
    console.log("========================================");
    console.log("");

    await connectDatabase();

    const author = await seedAuthor();

    const categoryMap = await seedCategories();

    await seedSubcategories(categoryMap);

    await seedSettings();

    await seedDemoArticle(
      author,
      categoryMap
    );

    console.log("");
    console.log("========================================");
    console.log("          SEED COMPLETE ✓");
    console.log("========================================");
    console.log("");

  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("          SEED FAILED ✗");
    console.error("========================================");
    console.error("");
    console.error(error.message);
    console.error("");
    process.exitCode = 1;

  } finally {
    await mongoose.connection.close();
  }
}


// ------------------------------------------------------------
// RUN
// ------------------------------------------------------------

seed();