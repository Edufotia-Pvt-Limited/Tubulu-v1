const multer = require("multer");

const storage = multer.memoryStorage();

/**
 * -----------------------
 * Catalogue Upload Config
 * -----------------------
 */
const catalogueFileFilter = (req, file, cb) => {
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed for catalogue uploads!"), false);
  }
};

const catalogueUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: catalogueFileFilter,
}).single("csvFile"); // field name for catalogue


/**
 * -----------------------
 * Product Image Upload Config
 * -----------------------
 */
const imageFileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") // allow png, jpeg, webp, etc.
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const productImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
  fileFilter: imageFileFilter,
}).array("images", 4); // field name for product images (max 4)




const advertisementBannerFileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for advertisement banner!"), false);
  }
};


const advertisementBannerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: advertisementBannerFileFilter,
}).single("banner");


const audioFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed!"), false);
  }
};

const audioUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: audioFileFilter,
}).single("audio");


module.exports = { catalogueUpload, productImageUpload, advertisementBannerUpload, audioUpload };
