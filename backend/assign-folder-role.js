require("dotenv").config();

const https = require("https");

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const folderExternalId =
  "d0793f3a548977107614123fe93c7b35f4";

const folderRole =
  "cld::role::content::folder::editor";

function assignFolderRole() {
  return new Promise((resolve, reject) => {
    const auth = Buffer
      .from(`${apiKey}:${apiSecret}`)
      .toString("base64");

    const body = JSON.stringify({
      principal: {
        id: apiKey,
        type: "apiKey"
      },
      operation: "add",
      roles: [folderRole]
    });

    const options = {
      hostname: "api.cloudinary.com",

      path:
        `/v1_1/${cloudName}` +
        `/folder_operations/invite/${folderExternalId}`,

      method: "POST",

      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let response = "";

      res.on("data", (chunk) => {
        response += chunk;
      });

      res.on("end", () => {
        try {
          const data = JSON.parse(response);

          if (
            res.statusCode >= 200 &&
            res.statusCode < 300
          ) {
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
            data: response
          });
        }
      });
    });

    req.on("error", reject);

    req.write(body);
    req.end();
  });
}

async function main() {
  try {
    console.log(
      "Assigning Contributor access to Dhoorth API key...\n"
    );

    const result = await assignFolderRole();

    console.log(
      "Folder role assigned successfully:\n"
    );

    console.log(
      JSON.stringify(result, null, 2)
    );

  } catch (error) {
    console.error(
      "Failed to assign folder role:\n"
    );

    console.error(error);
  }
}

main();