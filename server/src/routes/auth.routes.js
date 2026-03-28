const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { login, profile, register } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(profile));

module.exports = router;
