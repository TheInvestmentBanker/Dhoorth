require("dotenv").config();

const cloudinary = require("./cloudinary");

async function testFolders() {
  try {
    console.log("Checking Cloudinary folders...\n");

    const result = await cloudinary.api.root_folders();

    console.log("Cloudinary folder access successful:\n");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Cloudinary folder access failed:\n");

    console.error("Message:", error.message);

    if (error.http_code) {
      console.error("HTTP Code:", error.http_code);
    }

    if (error.name) {
      console.error("Name:", error.name);
    }

    console.error("\nFull error:");
    console.error(error);
  }
}

testFolders();