const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { Storage } = require("@google-cloud/storage");
const { config } = require("../config");

// GCP Storage setup
const storageOptions = {};
if (config.gcpKeyFile) {
  storageOptions.keyFilename = config.gcpKeyFile;
}
if (config.gcpProjectId) {
  storageOptions.projectId = config.gcpProjectId;
}
const storage = new Storage(storageOptions);

// 🔹 Manual slugify function (no external package)
function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with `-`
    .replace(/^-+|-+$/g, "");    // remove leading/trailing dashes
}

/**
 * Upload file buffer to Google Cloud Storage (internals renamed from AWS)
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 * @param {string} fileName
 * @param {string} integrationId
 * @param {string} integrationName
 * @param {string} prefix
 * @returns {Promise<{success: boolean, url: string, key: string}>}
 */
exports.uploadFileToAws = (
  fileBuffer,
  mimeType,
  fileName,
  integrationId,
  integrationName,
  prefix = ""
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const integrationFolder = toSlug(integrationName) + "_" + integrationId;
      const _fileName =
        (prefix ? `${prefix}/` : "") +
        integrationFolder +
        "/" +
        moment().valueOf().toString() +
        "_" +
        uuidv4() +
        "_" +
        fileName;

      if (!config.gcpBucket || config.gcpBucket === "gcp_bucket_placeholder") {
        console.log("⚠️ Using GCP Storage Mock for testing. Saving locally.");
        const fs = require('fs');
        const path = require('path');
        const publicImagesDir = path.join(__dirname, '..', 'public', 'images');
        if (!fs.existsSync(publicImagesDir)) {
          fs.mkdirSync(publicImagesDir, { recursive: true });
        }
        const localFileName = uuidv4() + "_" + fileName;
        fs.writeFileSync(path.join(publicImagesDir, localFileName), fileBuffer);

        return resolve({
          success: true,
          url: `http://localhost:3008/images/${localFileName}`,
          key: localFileName,
        });
      }

      const bucket = storage.bucket(config.gcpBucket);
      const file = bucket.file(_fileName);

      await file.save(fileBuffer, {
        contentType: mimeType,
        resumable: false,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        }
      });

      try {
        await file.makePublic();
      } catch (aclError) {
        console.log("Could not set file ACL to public (Uniform Bucket-Level Access might be enabled):", aclError.message);
      }

      const publicUrl = `https://storage.googleapis.com/${config.gcpBucket}/${_fileName}`;
      resolve({
        success: true,
        url: publicUrl,
        key: _fileName,
      });
    } catch (err) {
      console.error("GCP Storage Upload Error:", err);
      reject(err);
    }
  });
};
