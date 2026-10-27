const express = require("express");
const router = express.Router();
const aiFitnessController = require("../controllers/aiFitnessController");

// Health check for Ollama status
router.get("/fitness/health", aiFitnessController.healthCheck);

// Get personalized sport recommendations based on user profile
router.post("/fitness/recommendations", aiFitnessController.getSportRecommendations);

// Get workout tip
router.post("/fitness/tip", aiFitnessController.getWorkoutTip);

// Chat with fitness AI
router.post("/fitness/chat", aiFitnessController.fitnessChat);

module.exports = router;
