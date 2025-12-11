// routes/symptomRoutes.js
const express = require("express");
const router = express.Router();
const { addSymptom, getSymptoms } = require("../controllers/symptomController");
const { protect } = require("../middleware/authMiddleware");

// Add a new symptom
router.post("/add", protect, addSymptom);

// Get all symptoms
router.get("/", protect, getSymptoms);

module.exports = router;


