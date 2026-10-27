const express = require("express");
const router = express.Router();
const aiMentalHealthController = require("../controllers/aiMentalHealthController");

// Health check for Ollama status
router.get("/mentalhealth/health", aiMentalHealthController.healthCheck);

// Get personalized wellness recommendations based on assessment
router.post("/mentalhealth/recommendations", aiMentalHealthController.getWellnessRecommendations);

// Get guided exercise
router.post("/mentalhealth/exercise", aiMentalHealthController.getGuidedExercise);

// Get coping strategy
router.post("/mentalhealth/coping", aiMentalHealthController.getCopingStrategy);

// Chat with mental health AI
router.post("/mentalhealth/chat", aiMentalHealthController.mentalHealthChat);

module.exports = router;
