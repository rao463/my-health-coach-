const mongoose = require("mongoose");

const FitnessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  activityType: {
    type: String,
    required: true,
    trim: true // e.g., "running", "yoga"
  },
  duration: {
    type: Number, // duration in minutes
    required: true
  },
  caloriesBurned: {
    type: Number
  },
  notes: {
    type: String,
    trim: true
  },
  aiRecommendation: {
    type: String,
    default: "" // AI-generated advice
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Fitness", FitnessSchema);
