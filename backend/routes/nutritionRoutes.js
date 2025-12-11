const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { addNutrition, getNutrition } = require("../controllers/nutritionController");

// Add nutrition record
router.post("/add", protect, addNutrition);

// Get all nutrition records for user
router.get("/", protect, getNutrition);

module.exports = router;






