const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { addFitness, getFitness } = require("../controllers/fitnessController");

router.post("/add", protect, addFitness);
router.get("/", protect, getFitness);

module.exports = router;





