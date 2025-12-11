// services/notificationService.js
const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

// Set VAPID keys from .env
webpush.setVapidDetails(
  `mailto:${process.env.SMTP_USER}`, // can be any verified email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a single user
 * @param {ObjectId} userId - The user's MongoDB ID
 * @param {Object} payload - { title, body, url }
 */
async function sendWebPushToUser(userId, payload) {
  const subscriptions = await PushSubscription.find({ userId });
  const pushPromises = subscriptions.map(sub => {
    return webpush.sendNotification(sub, JSON.stringify(payload))
      .catch(err => {
        // If subscription is invalid, delete it
        if (err.statusCode === 410 || err.statusCode === 404) {
          return PushSubscription.deleteOne({ _id: sub._id });
        }
        console.error("Web push error:", err);
      });
  });
  await Promise.all(pushPromises);
}

/**
 * Broadcast to all users
 * @param {Object} payload
 */
async function broadcastWebPush(payload) {
  const subscriptions = await PushSubscription.find({});
  const pushPromises = subscriptions.map(sub => {
    return webpush.sendNotification(sub, JSON.stringify(payload))
      .catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          return PushSubscription.deleteOne({ _id: sub._id });
        }
        console.error("Web push error:", err);
      });
  });
  await Promise.all(pushPromises);
}

module.exports = {
  sendWebPushToUser,
  broadcastWebPush
};
