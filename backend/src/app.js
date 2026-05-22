const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const courseRoutes = require("./routes/course.routes");
const lessonRoutes = require("./routes/lesson.routes");
const quizRoutes = require("./routes/quiz.routes");
const marketplaceRoutes = require("./routes/marketplace.routes");
const parentRoutes = require("./routes/parent.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.routes");
const studentRoutes = require("./routes/student.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use("/api/student", studentRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cho frontend truy cập ảnh đã upload
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Biology Learning API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      courses: "/api/courses",
      lessons: "/api/lessons",
      quizzes: "/api/quizzes",
      marketplace: "/api/marketplace",
      parent: "/api/parent",
      admin: "/api/admin",
      uploads: "/api/uploads",
      staticUploads: "/uploads",
      student: "/api/student",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File quá lớn. Vui lòng upload ảnh dưới 5MB.",
    });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;