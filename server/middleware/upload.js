import multer from "multer";
import path from "path";
import crypto from "crypto";
import { UPLOAD_DIR, ensureUploadDir } from "../config/uploadPaths.js";

ensureUploadDir();

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    const extension = path.extname(file.originalname) || ".pdf";
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    const error = new Error("Only PDF files are supported.");
    error.statusCode = 400;
    return cb(error);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const MAX_FILE_SIZE_LABEL = "20MB";

export default upload;
