const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupDetail
} = require("../controllers/group.controller");
const { createStudent, updateStudent, deleteStudent } = require("../controllers/student.controller");
const { createEvaluation, updateEvaluation, deleteEvaluation } = require("../controllers/evaluation.controller");
const { upsertGrade } = require("../controllers/grade.controller");
const { exportExcel, exportPdf, importExcel } = require("../controllers/export.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(listGroups));
router.post("/", asyncHandler(createGroup));
router.get("/:groupId", asyncHandler(getGroupDetail));
router.put("/:groupId", asyncHandler(updateGroup));
router.delete("/:groupId", asyncHandler(deleteGroup));

router.post("/:groupId/students", asyncHandler(createStudent));
router.put("/:groupId/students/:studentId", asyncHandler(updateStudent));
router.delete("/:groupId/students/:studentId", asyncHandler(deleteStudent));

router.post("/:groupId/evaluations", asyncHandler(createEvaluation));
router.put("/:groupId/evaluations/:evaluationId", asyncHandler(updateEvaluation));
router.delete("/:groupId/evaluations/:evaluationId", asyncHandler(deleteEvaluation));

router.put("/:groupId/students/:studentId/evaluations/:evaluationId/grade", asyncHandler(upsertGrade));

router.get("/:groupId/export/excel", asyncHandler(exportExcel));
router.get("/:groupId/export/pdf", asyncHandler(exportPdf));
router.post("/:groupId/import/excel", upload.single("file"), asyncHandler(importExcel));

module.exports = router;
