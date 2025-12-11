const mongoose = require("mongoose");

const MentalHealthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  mood: {
    type: String,
    required: true,
    trim: true
  },
  stressLevel: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  notes: {
    type: String,
    trim: true
  },
  aiRecommendation: {
    type: String,
    default: "" // will store AI-generated advice
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("MentalHealth", MentalHealthSchema);





