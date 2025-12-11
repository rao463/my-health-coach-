const mongoose = require("mongoose");

const HealthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recordType: {
    type: String,
    required: true,
    trim: true // e.g., "blood test", "x-ray"
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    default: ""
  },
  aiNotes: {
    type: String,
    default: "" // optional AI-generated notes or summary
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("HealthRecord", HealthRecordSchema);




