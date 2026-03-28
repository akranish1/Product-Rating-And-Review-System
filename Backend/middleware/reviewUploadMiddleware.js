const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDir = path.join(__dirname, "..", "uploads");
const maxUploadSize = 5 * 1024 * 1024;

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const createReviewUploadMiddleware = () => {
  ensureUploadsDir();

  return multer({
    storage: multer.diskStorage({
      destination: (_, __, cb) => cb(null, uploadsDir),
      filename: (_, file, cb) => {
        const safeName = file.originalname.replace(/[^\w.]/g, "_");
        cb(null, `${Date.now()}-${safeName}`);
      },
    }),
    limits: {
      fileSize: maxUploadSize,
    },
  });
};

const buildStoredImagePaths = (files = []) =>
  files.map((file) => `/uploads/${file.filename}`);

const deleteUploadedFiles = async (filePaths = []) => {
  await Promise.all(
    filePaths.filter(Boolean).map((filePath) =>
      fs.promises.unlink(filePath).catch(() => null)
    )
  );
};

const deleteReviewImages = async (images = []) => {
  const managedFiles = images
    .filter(
      (imagePath) =>
        typeof imagePath === "string" && imagePath.startsWith("/uploads/")
    )
    .map((imagePath) => path.join(uploadsDir, path.basename(imagePath)));

  await deleteUploadedFiles(managedFiles);
};

module.exports = {
  buildStoredImagePaths,
  createReviewUploadMiddleware,
  deleteReviewImages,
  deleteUploadedFiles,
  ensureUploadsDir,
  uploadsDir,
};
