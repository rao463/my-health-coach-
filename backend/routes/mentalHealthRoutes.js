const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { addMentalHealth, getMentalHealth } = require("../controllers/mentalHealthController");

router.post("/add", protect, addMentalHealth);
router.get("/", protect, getMentalHealth);

module.exports = router;






