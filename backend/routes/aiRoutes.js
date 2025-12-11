const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { symptomChecker } = require("../controllers/aiController");

// GET AI symptom prediction
router.get("/symptoms", protect, symptomChecker);

module.exports = router;
