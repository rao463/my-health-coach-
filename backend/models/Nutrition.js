const mongoose = require("mongoose");

const NutritionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  weight: Number,
  height: Number,
  age: Number,
  gender: {
    type: String,
    enum: ["male", "female", "other"]
  },
  activityLevel: {
    type: String,
    enum: ["sedentary", "light", "moderate", "active", "very active"],
    default: "sedentary"
  },
  dietPreference: String,
  aiRecommendation: {
    type: String,
    default: ""
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Nutrition", NutritionSchema);



