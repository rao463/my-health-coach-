const mongoose = require("mongoose");

const MedicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true }, // e.g., "2 times a day"
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  aiRecommendation: { type: String, default: "" }, // optional AI advice
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Medication", MedicationSchema);


