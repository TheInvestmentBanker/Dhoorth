require("dotenv").config();

const cloudinary = require("./cloudinary");

async function createFolders() {
  try {
    console.log("Creating Dhoorth folders...\n");

    const dhoorth = await cloudinary.api.create_folder("dhoorth");

    console.log("Created root folder:");
    console.log(dhoorth);

    const media = await cloudinary.api.create_folder("dhoorth/media");

    console.log("\nCreated media folder:");
    console.log(media);

    console.log("\nDhoorth folder structure is ready.");
  } catch (error) {
    console.error("Folder creation failed:\n");

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

createFolders();