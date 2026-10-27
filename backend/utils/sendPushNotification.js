// Backend utility to send push notifications
const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

// Configure web-push with VAPID keys
// Generate these with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com", // Replace with your email
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

/**
 * Send push notification to a specific user
 * @param {string} userId - The user's MongoDB ID
 * @param {object} payload - The notification payload { title, body, icon, url }
 */
const sendToUser = async (userId, payload) => {
  try {
    const subscriptions = await PushSubscription.find({ userId });

    if (subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return { success: false, message: "No subscriptions found" };
    }

    const notificationPayload = JSON.stringify({
      title: payload.title || "My Health Coach",
      body: payload.body || "You have a new notification",
      icon: payload.icon || "/logo.png",
      url: payload.url || "/dashboard",
      timestamp: Date.now(),
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            notificationPayload
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          // Remove invalid subscriptions (expired or unsubscribed)
          if (error.statusCode === 404 || error.statusCode === 410) {
            await PushSubscription.deleteOne({ _id: sub._id });
            console.log(`Removed invalid subscription: ${sub.endpoint}`);
          }
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    return { success: true, results };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to all users
 * @param {object} payload - The notification payload { title, body, icon, url }
 */
const sendToAll = async (payload) => {
  try {
    const subscriptions = await PushSubscription.find({});

    if (subscriptions.length === 0) {
      return { success: false, message: "No subscriptions found" };
    }

    const notificationPayload = JSON.stringify({
      title: payload.title || "My Health Coach",
      body: payload.body || "You have a new notification",
      icon: payload.icon || "/logo.png",
      url: payload.url || "/dashboard",
      timestamp: Date.now(),
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            notificationPayload
          );
          return { success: true };
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            await PushSubscription.deleteOne({ _id: sub._id });
          }
          return { success: false, error: error.message };
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    return { success: true, sent: successful, total: subscriptions.length };
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send medication reminder
 */
const sendMedicationReminder = async (userId, medicationName) => {
  return sendToUser(userId, {
    title: "Medication Reminder",
    body: `Time to take your ${medicationName}!`,
    icon: "/logo.png",
    url: "/medication-reminder",
  });
};

/**
 * Send health tip notification
 */
const sendHealthTip = async (userId, tip) => {
  return sendToUser(userId, {
    title: "Health Tip",
    body: tip,
    icon: "/logo.png",
    url: "/dashboard",
  });
};

module.exports = {
  sendToUser,
  sendToAll,
  sendMedicationReminder,
  sendHealthTip,
};
