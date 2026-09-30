require("dotenv").config();

const https = require("https");

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const folderExternalId =
  "d0793f3a548977107614123fe93c7b35f4";

function getFolderRoles() {
  return new Promise((resolve, reject) => {
    const auth = Buffer
      .from(`${apiKey}:${apiSecret}`)
      .toString("base64");

    const options = {
      hostname: "api.cloudinary.com",
      path:
        `/v1_1/${cloudName}` +
        `/folder_operations/invite/${folderExternalId}`,
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`
      }
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const data = JSON.parse(body);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject({
              statusCode: res.statusCode,
              data
            });
          }
        } catch {
          reject({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on("error", reject);

    req.end();
  });
}

async function testFolderRoles() {
  try {
    console.log("Checking Dhoorth media folder roles...\n");

    const result = await getFolderRoles();

    console.log("Folder roles retrieved successfully:\n");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Failed to retrieve folder roles:\n");

    console.error(error);
  }
}

testFolderRoles();