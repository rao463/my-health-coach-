const mongoose = require("mongoose");

const MedicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true }, // e.g., "2 times a day"
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  times: [{ type: String }], // e.g., ["08:00", "14:00", "20:00"]
  timezone: { type: String, default: "UTC" }, // user's timezone
  aiReminder: { type: String, default: "" }, // AI-generated reminder message
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Medication", MedicationSchema);


