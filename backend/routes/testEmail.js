// routes/testEmail.js
const express = require("express");
const router = express.Router();
const { sendEmail } = require("../services/emailService");

router.get("/send-test", async (req, res) => {
  try {
    await sendEmail("your_test_email@example.com", "Test from Brevo", "Hello — test email", "<p>Hello — <strong>test</strong> email</p>");
    res.json({ success: true, message: "Test email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
