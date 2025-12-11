const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

// GET dashboard data
router.get("/", protect, getDashboard);

module.exports = router;
