// services/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.sendinblue.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// verify transporter (optional)
transporter.verify().then(() => {
  console.log("SMTP transporter ready (Brevo)");
}).catch(err => {
  console.error("SMTP transporter verify failed:", err);
});

async function sendEmail(to, subject, text, html) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail, transporter };
