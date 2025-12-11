const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addMedication,
  getUserMedications,
  deleteMedication
} = require("../controllers/medicationController");

// Add medication
router.post("/add", protect, addMedication);

// Get all medications
router.get("/", protect, getUserMedications);

// Delete medication
router.delete("/:id", protect, deleteMedication);

module.exports = router;

