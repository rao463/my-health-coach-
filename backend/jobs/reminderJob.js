// jobs/reminderJob.js
const cron = require("node-cron");
const moment = require("moment-timezone");
const Medication = require("../models/Medication");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const { sendWebPushToUser } = require("../services/notificationService");

// Run every minute
const reminderJob = cron.schedule("* * * * *", async () => {
  try {
    const nowUtc = new Date();

    // Fetch active medications
    const meds = await Medication.find({
      $or: [
        { times: { $exists: true, $ne: [] } },
        { startDate: { $lte: nowUtc } }
      ],
      $and: [
        { $or: [{ endDate: null }, { endDate: { $gte: nowUtc } }] }
      ]
    }).populate("userId");

    for (const med of meds) {
      const user = med.userId;
      if (!user || !user.email) continue; // skip if no user/email

      const tz = med.timezone || "UTC";
      let shouldNotify = false;

      // Check if current time matches any scheduled times
      if (Array.isArray(med.times) && med.times.length) {
        const nowInTz = moment().tz(tz);
        const nowHM = nowInTz.format("HH:mm");
        if (med.times.includes(nowHM)) shouldNotify = true;
      } else {
        // If no times set, check if startDate is within the last minute
        const diffMs = Math.abs(nowUtc - med.startDate);
        if (diffMs < 60 * 1000) shouldNotify = true;
      }

      if (!shouldNotify) continue;

      // Notification content
      const title = "Medication Reminder";
      const text = med.aiReminder || `Time to take ${med.name} — ${med.dosage}.`;
      const payload = {
        title,
        body: text,
        url: process.env.APP_BASE_URL || "/" // opens app when clicked
      };

      // Send email via Brevo
      try {
        await sendEmail(user.email, title, text, `<p>${text}</p>`);
      } catch (err) {
        console.error("Email send error:", err);
      }

      // Send web push notification
      try {
        await sendWebPushToUser(user._id, payload);
      } catch (err) {
        console.error("Push send error:", err);
      }

      // Optional: Record sent notifications in DB to prevent duplicates (future improvement)
    }

  } catch (err) {
    console.error("Reminder Job Error:", err);
  }
});

module.exports = reminderJob;
