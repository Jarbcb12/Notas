const multer = require("multer");
const AppError = require("../utils/appError");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    const isExcel =
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls");

    if (!isExcel) {
      cb(new AppError("Solo se permiten archivos Excel .xlsx o .xls", 400));
      return;
    }

    cb(null, true);
  }
});

module.exports = upload;
