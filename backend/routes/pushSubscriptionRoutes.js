// routes/pushSubscriptionRoutes.js
const express = require("express");
const router = express.Router();
const { subscribe, unsubscribe } = require("../controllers/pushSubscriptionController");
const { protect } = require("../middleware/authMiddleware");

// Register a new push subscription
router.post("/subscribe", protect, subscribe);

// Remove a push subscription
router.post("/unsubscribe", protect, unsubscribe);

module.exports = router;

