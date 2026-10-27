// routes/pushSubscriptionRoutes.js
const express = require("express");
const router = express.Router();
const { subscribe, unsubscribe } = require("../controllers/pushSubscriptionController");
const { protect } = require("../middleware/authMiddleware");
const { sendToUser } = require("../utils/sendPushNotification");

// Register a new push subscription
router.post("/subscribe", protect, subscribe);

// Remove a push subscription
router.post("/unsubscribe", protect, unsubscribe);

// Send test notification to current user
router.post("/test", protect, async (req, res) => {
  try {
    const result = await sendToUser(req.user._id, {
      title: "Test Notification",
      body: "Push notifications are working! You'll receive health reminders here.",
      url: "/dashboard",
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

