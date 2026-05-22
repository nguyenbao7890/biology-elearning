const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authMiddleware, allowRoles } = require("../middleware/auth.middleware");

const router = express.Router();

const uploadFolders = {
  courses: "uploads/courses",
  lessons: "uploads/lessons",
  "lesson-documents": "uploads/lesson-documents",
  "lesson-slides": "uploads/lesson-slides",
};

const allowedFileTypes = {
  courses: ["image/"],
  lessons: ["image/"],
  "lesson-documents": [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/vnd.rar",
    "text/plain",
    "text/csv",
  ],
  "lesson-slides": [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = uploadFolders[req.params.type] ? req.params.type : "courses";
    const folder = uploadFolders[type];

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 60);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBaseName}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    const type = uploadFolders[req.params.type] ? req.params.type : "courses";
    const allowedTypes = allowedFileTypes[type] || allowedFileTypes.courses;

    const isAllowed = allowedTypes.some((allowedType) => {
      if (allowedType.endsWith("/")) {
        return file.mimetype.startsWith(allowedType);
      }

      return file.mimetype === allowedType;
    });

    if (!isAllowed) {
      cb(new Error("Định dạng file không được hỗ trợ"));
      return;
    }

    cb(null, true);
  },
});

router.post(
  "/:type",
  authMiddleware,
  allowRoles("admin"),
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Chưa có file upload" });
    }

    const type = uploadFolders[req.params.type] ? req.params.type : "courses";

    res.status(201).json({
      message: "Upload success",
      url: `/uploads/${type}/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  }
);

module.exports = router;
