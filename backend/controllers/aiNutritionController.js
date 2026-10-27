// AI Nutrition Controller - Uses Ollama for local AI-powered nutrition tips

const { Ollama } = require("ollama");

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://localhost:11434";
let OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

// Create Ollama client
const ollama = new Ollama({ host: OLLAMA_BASE_URL });

// Cache for available model
let cachedModel = null;

// Get the best available model
async function getAvailableModel() {
  if (cachedModel) return cachedModel;

  try {
    const response = await ollama.list();
    const models = response.models || [];

    if (models.length === 0) return null;

    // Preferred models in order
    const preferredModels = ["llama3", "llama3.2", "llama3.1", "llama2", "mistral", "gemma", "phi"];

    // Try to find a preferred model
    for (const preferred of preferredModels) {
      const found = models.find(m => m.name.toLowerCase().startsWith(preferred));
      if (found) {
        cachedModel = found.name;
        console.log(`Using Ollama model: ${cachedModel}`);
        return cachedModel;
      }
    }

    // Use first available model if no preferred found
    cachedModel = models[0].name;
    console.log(`Using Ollama model: ${cachedModel}`);
    return cachedModel;
  } catch (error) {
    console.error("Failed to get models:", error.message);
    return null;
  }
}

// Helper function to call Ollama API using chat endpoint
async function callOllama(userPrompt, systemPrompt = "") {
  const model = await getAvailableModel();
  if (!model) {
    throw new Error("No Ollama model available");
  }

  const messages = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: userPrompt });

  const response = await ollama.chat({
    model: model,
    messages: messages,
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 300,
    },
  });

  return response.message?.content || "";
}

// Check if Ollama is available and has models
async function checkOllamaHealth() {
  try {
    const model = await getAvailableModel();
    return { online: true, hasModel: !!model, model };
  } catch (error) {
    console.error("Ollama health check failed:", error.message);
    return { online: false, hasModel: false, model: null };
  }
}

// Get personalized nutrition tip based on meal data
exports.getNutritionTip = async (req, res) => {
  try {
    const { meals, totalCalories, goalCalories, mealBreakdown } = req.body;

    // Check if Ollama is running
    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        tip: null,
        fallbackTip: "Stay hydrated and aim for balanced meals with protein, healthy fats, and fiber!",
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are a friendly, knowledgeable nutritionist AI assistant. Provide brief, actionable, and personalized nutrition advice. Keep responses concise (2-3 sentences max). Be encouraging and positive. Focus on practical tips the user can implement today. Do not provide medical diagnoses or prescribe treatments. Do not use markdown formatting.`;

    let prompt = `Based on the user's food log today, provide a personalized nutrition tip.\n\n`;
    prompt += `Daily calorie goal: ${goalCalories || 2000} cal\n`;
    prompt += `Calories consumed so far: ${totalCalories || 0} cal\n`;
    prompt += `Remaining: ${(goalCalories || 2000) - (totalCalories || 0)} cal\n\n`;

    if (mealBreakdown) {
      prompt += `Meal breakdown:\n`;
      prompt += `- Breakfast: ${mealBreakdown.breakfast || 0} cal\n`;
      prompt += `- Lunch: ${mealBreakdown.lunch || 0} cal\n`;
      prompt += `- Dinner: ${mealBreakdown.dinner || 0} cal\n`;
      prompt += `- Snacks: ${mealBreakdown.snacks || 0} cal\n\n`;
    }

    if (meals && meals.length > 0) {
      prompt += `Foods logged today:\n`;
      meals.slice(0, 10).forEach((meal) => {
        prompt += `- ${meal.name}${meal.calories ? ` (${meal.calories} cal)` : ""}${meal.notes ? ` - ${meal.notes}` : ""}\n`;
      });
    } else {
      prompt += `No meals logged yet today.\n`;
    }

    prompt += `\nProvide a personalized, encouraging nutrition tip based on this data (2-3 sentences only):`;

    const tip = await callOllama(prompt, systemPrompt);
    res.json({ tip: tip.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama nutrition tip error:", error.message);
    res.json({
      tip: null,
      fallbackTip: "Stay hydrated and aim for balanced meals with protein, healthy fats, and fiber!",
      error: error.message,
      ollamaStatus: "error",
    });
  }
};

// Analyze a specific meal for nutritional insights
exports.analyzeMeal = async (req, res) => {
  try {
    const { mealName, mealType, notes } = req.body;

    if (!mealName) {
      return res.status(400).json({ error: "Meal name is required" });
    }

    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.status(503).json({ error: "Ollama service is not available" });
    }

    const systemPrompt = `You are a nutrition expert. Provide brief, helpful analysis of meals. Include estimated calories if not provided, and suggest ways to make the meal healthier if applicable. Keep responses to 2-3 sentences. Do not use markdown formatting.`;

    const prompt = `Analyze this meal:\nMeal: ${mealName}\nType: ${mealType || "Not specified"}\n${notes ? `Notes: ${notes}` : ""}\n\nProvide a brief nutritional insight:`;

    const analysis = await callOllama(prompt, systemPrompt);
    res.json({ analysis: analysis.trim() });
  } catch (error) {
    console.error("Ollama meal analysis error:", error.message);
    res.status(500).json({ error: "Failed to analyze meal" });
  }
};

// Get meal suggestions based on remaining calories and preferences
exports.getMealSuggestions = async (req, res) => {
  try {
    const { remainingCalories, mealType, preferences, restrictions } = req.body;

    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.status(503).json({ error: "Ollama service is not available" });
    }

    const systemPrompt = `You are a helpful nutrition assistant. Suggest healthy, practical meal ideas. Keep suggestions brief and realistic. Provide 2-3 options max. Do not use markdown formatting.`;

    let prompt = `Suggest ${mealType || "meal"} options for someone with ${remainingCalories || "unknown"} calories remaining today.\n`;

    if (preferences) {
      prompt += `Preferences: ${preferences}\n`;
    }
    if (restrictions) {
      prompt += `Dietary restrictions: ${restrictions}\n`;
    }

    prompt += `\nProvide 2-3 quick, healthy suggestions:`;

    const suggestions = await callOllama(prompt, systemPrompt);
    res.json({ suggestions: suggestions.trim() });
  } catch (error) {
    console.error("Ollama meal suggestions error:", error.message);
    res.status(500).json({ error: "Failed to get meal suggestions" });
  }
};

// Chat with nutrition AI
exports.nutritionChat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        response: health.online
          ? "No AI model found. Please run 'ollama pull llama3' to download a model."
          : "I'm sorry, the AI service is currently offline. Please make sure Ollama is running on your computer. You can start it with 'ollama serve' in your terminal.",
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are a friendly nutritionist AI assistant called NutriCoach. Help users with nutrition questions, meal planning, and healthy eating tips. Be encouraging and practical. Keep responses concise but helpful (3-4 sentences max). Do not provide medical diagnoses or prescribe treatments. If asked about medical conditions, recommend consulting a healthcare professional. Do not use markdown formatting.`;

    let prompt = message;
    if (context) {
      prompt = `Context: User has logged ${context.totalCalories || 0} calories today (goal: ${context.goalCalories || 2000}).\n\nUser question: ${message}`;
    }

    const response = await callOllama(prompt, systemPrompt);
    res.json({ response: response.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama nutrition chat error:", error.message);
    res.json({
      response: "Sorry, I encountered an error processing your request. Please try again.",
      error: error.message,
      ollamaStatus: "error",
    });
  }
};

// Health check endpoint
exports.healthCheck = async (_req, res) => {
  try {
    const health = await checkOllamaHealth();

    res.json({
      ollama: health.online ? "online" : "offline",
      model: health.model || OLLAMA_MODEL,
      modelAvailable: health.hasModel,
      url: OLLAMA_BASE_URL,
    });
  } catch (error) {
    res.json({
      ollama: "offline",
      model: OLLAMA_MODEL,
      modelAvailable: false,
      url: OLLAMA_BASE_URL,
      error: error.message,
    });
  }
};
