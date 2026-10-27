const express = require("express");
const router = express.Router();
const aiNutritionController = require("../controllers/aiNutritionController");

// Health check for Ollama status
router.get("/nutrition/health", aiNutritionController.healthCheck);

// Get personalized nutrition tip based on meal data
router.post("/nutrition/tip", aiNutritionController.getNutritionTip);

// Analyze a specific meal
router.post("/nutrition/analyze", aiNutritionController.analyzeMeal);

// Get meal suggestions
router.post("/nutrition/suggestions", aiNutritionController.getMealSuggestions);

// Chat with nutrition AI
router.post("/nutrition/chat", aiNutritionController.nutritionChat);

module.exports = router;
