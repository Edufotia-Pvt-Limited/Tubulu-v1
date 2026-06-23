const { Storage } = require("@google-cloud/storage");
const moment = require('moment');
const { config } = require('../config');
const fs = require('fs');
const path = require('path');

// GCP Storage setup
const storageOptions = {};
if (config.gcpKeyFile) {
  storageOptions.keyFilename = config.gcpKeyFile;
}
if (config.gcpProjectId) {
  storageOptions.projectId = config.gcpProjectId;
}
const storage = new Storage(storageOptions);

exports.uploadBase64ToAws = (fileBase64, mimeType, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const buf = Buffer.from(fileBase64, 'base64');
      const _fileName = 'tubulu-II/' + moment().valueOf().toString() + '_' + fileName;

      if (!config.gcpBucket || config.gcpBucket === "gcp_bucket_placeholder") {
        console.log("💾 Local environment detected. Saving file to local public/images directory.");
        const publicDir = path.join(__dirname, '..', 'public', 'images');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        const localFileName = moment().valueOf().toString() + '_' + fileName;
        const filePath = path.join(publicDir, localFileName);
        
        fs.writeFileSync(filePath, buf);
        
        const fileUrl = `/images/${localFileName}`;
        return resolve({
          success: true,
          s3FileName: fileUrl
        });
      }

      const bucket = storage.bucket(config.gcpBucket);
      const file = bucket.file(_fileName);

      await file.save(buf, {
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
        s3FileName: publicUrl
      });
    } catch (err) {
      console.error("GCP Storage Base64 Upload Error:", err);
      reject(err);
    }
  });
};