// controllers/pushSubscriptionController.js
const PushSubscription = require("../models/PushSubscription");

/**
 * Subscribe (register) a push subscription
 */
const subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    const userId = req.user._id;

    const existing = await PushSubscription.findOne({ endpoint });
    if (!existing) {
      await PushSubscription.create({ userId, endpoint, keys });
    }

    res.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Unsubscribe (remove) a push subscription
 */
const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.deleteOne({ endpoint });
    res.json({ success: true, message: "Unsubscribed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { subscribe, unsubscribe };
