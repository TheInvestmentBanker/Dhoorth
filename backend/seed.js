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
// Creates / updates:
//   1. Author account
//   2. Categories
//   3. Subcategories
//   4. Site settings
//   5. Demo article — only when database has no articles
//
// Required environment variables:
//
//   MONGO_URI
//   ADMIN_USER
//   ADMIN_PASSWORD
//
// ADMIN_USER is the Author login identifier.
// The current User model stores this value in the `email` field,
// so we keep that field for compatibility with the existing
// authentication system.
//
// IMPORTANT:
// Never put these secrets in the frontend.
// ============================================================


// ------------------------------------------------------------
// 1. CATEGORIES
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
// 2. SUBCATEGORIES
// ------------------------------------------------------------

const subcategories = {
  "Global Politics": [
    "US Section",
    "UK Section",
    "Russia Section",
    "Pakistan Section",
  ],

  Technology: [
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

  Finance: [
    "Markets",
    "Economy",
    "Business & Industry",
  ],
};


// ------------------------------------------------------------
// 3. CONNECT TO MONGODB
// ------------------------------------------------------------

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is missing from the environment variables."
    );
  }

  await mongoose.connect(mongoUri);

  console.log("✓ Connected to MongoDB");
}


// ------------------------------------------------------------
// 4. CREATE / UPDATE AUTHOR
// ------------------------------------------------------------

async function seedAuthor() {
  const loginUser = process.env.ADMIN_USER?.trim();

  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!loginUser) {
    throw new Error(
      "ADMIN_USER is missing from the environment variables."
    );
  }

  if (!rawPassword) {
    throw new Error(
      "ADMIN_PASSWORD is missing from the environment variables."
    );
  }

  if (rawPassword.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must contain at least 8 characters."
    );
  }

  // The existing authentication system uses the User.email
  // field as the login identifier.
  const email = loginUser.toLowerCase();

  const hashedPassword = await bcrypt.hash(
    rawPassword,
    12
  );

  const author = await User.findOneAndUpdate(
    { email },
    {
      name: "Author",
      slug: "author",
      email,
      password: hashedPassword,
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

  console.log(
    `✓ ${categories.length} categories ready`
  );

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

  console.log(
    `✓ ${count} subcategories ready`
  );
}


// ------------------------------------------------------------
// 7. SITE SETTINGS
// ------------------------------------------------------------

async function seedSettings() {
  const siteSettings = {
    siteName: "DHOORTH",

    description:
      "Independent publication for news, analysis, research and long-form stories.",

    commentsEnabled: true,

    adsEnabled: true,

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
// The demo article is created ONLY when there are zero articles.
//
// Once you publish real articles, running seed.js again will NOT
// overwrite them or recreate the demo article.
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
    headline:
      "A Modular Editorial Platform — Demo Story",

    slug:
      "modular-editorial-platform-demo",

    subtitle:
      "DEMO CONTENT — replace before publication",

    summary:
      "Sample article showing the publication architecture.",

    articleType:
      "DEEP DIVE",

    author:
      author._id,

    place:
      "",

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

        heading:
          "Build stories from blocks",

        level: 2,
      },

      {
        type: "paragraph",

        text:
          "The author can add paragraphs, headings, images, videos, documents, quotes, lists and highlights without changing source code.",
      },
    ],

    sources: [],

    status:
      "published",

    publishedAt:
      new Date(),

    featured:
      true,

    trending:
      true,

    breaking:
      false,

    commentsEnabled:
      true,

    views:
      0,
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

    // Connect
    await connectDatabase();

    // Author
    const author = await seedAuthor();

    // Categories
    const categoryMap = await seedCategories();

    // Subcategories
    await seedSubcategories(categoryMap);

    // Site settings
    await seedSettings();

    // Demo article
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

    console.error(
      error.stack || error.message
    );

    console.error("");

    process.exitCode = 1;

  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}


// ------------------------------------------------------------
// 10. RUN
// ------------------------------------------------------------

seed();