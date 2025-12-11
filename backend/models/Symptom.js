const mongoose = require("mongoose");

const SymptomSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    symptom: {
        type: String,
        required: true,
        trim: true
    },
    severity: {
        type: String,
        enum: ["mild", "moderate", "severe"],
        default: "mild"
    },
    aiRecommendation: {
        type: String,
        default: "" // AI-generated recommendation will be stored here
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Symptom", SymptomSchema);
