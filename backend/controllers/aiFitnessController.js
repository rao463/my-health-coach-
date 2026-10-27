// AI Fitness Controller - Uses Ollama for local AI-powered fitness recommendations

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
        console.log(`Using Ollama model for fitness: ${cachedModel}`);
        return cachedModel;
      }
    }

    // Use first available model if no preferred found
    cachedModel = models[0].name;
    console.log(`Using Ollama model for fitness: ${cachedModel}`);
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
      num_predict: 500,
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

// Get sport recommendations based on user profile
exports.getSportRecommendations = async (req, res) => {
  try {
    const {
      fitnessLevel,
      goals,
      availableTime,
      preferences,
      limitations,
      age,
      equipment,
    } = req.body;

    // Check if Ollama is running
    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        recommendations: null,
        fallbackRecommendations: getDefaultRecommendations(fitnessLevel, goals),
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are FitCoach, a friendly and knowledgeable fitness AI assistant. Based on the user's profile, recommend 3-5 sports or physical activities that would be perfect for them. For each recommendation, briefly explain why it suits them. Be encouraging and practical. Keep responses concise. Do not use markdown formatting or bullet points with asterisks - use plain text with numbered lists.`;

    let prompt = `Based on this fitness profile, recommend the best sports and activities:\n\n`;
    prompt += `Fitness Level: ${fitnessLevel || "Not specified"}\n`;
    prompt += `Goals: ${goals || "General fitness"}\n`;
    prompt += `Available Time: ${availableTime || "Not specified"}\n`;

    if (preferences) {
      prompt += `Preferences: ${preferences}\n`;
    }
    if (limitations) {
      prompt += `Physical Limitations/Concerns: ${limitations}\n`;
    }
    if (age) {
      prompt += `Age Range: ${age}\n`;
    }
    if (equipment) {
      prompt += `Available Equipment: ${equipment}\n`;
    }

    prompt += `\nProvide 3-5 personalized sport/activity recommendations with brief explanations (use numbered list format):`;

    const recommendations = await callOllama(prompt, systemPrompt);
    res.json({ recommendations: recommendations.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama fitness recommendations error:", error.message);
    res.json({
      recommendations: null,
      fallbackRecommendations: getDefaultRecommendations(req.body.fitnessLevel, req.body.goals),
      error: error.message,
      ollamaStatus: "error",
    });
  }
};

// Get workout tip based on current activity
exports.getWorkoutTip = async (req, res) => {
  try {
    const { workoutType, duration, intensity, recentWorkouts } = req.body;

    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        tip: null,
        fallbackTip: "Remember to warm up before exercise and cool down after. Stay hydrated!",
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are FitCoach, a supportive fitness AI. Provide a brief, helpful tip about the user's workout. Keep it to 2-3 sentences max. Be encouraging. Do not use markdown formatting.`;

    let prompt = `The user is planning a ${workoutType} workout for ${duration} minutes at ${intensity} intensity.\n`;

    if (recentWorkouts && recentWorkouts.length > 0) {
      prompt += `Recent workouts: ${recentWorkouts.slice(0, 3).map(w => w.type).join(", ")}.\n`;
    }

    prompt += `\nProvide a quick, personalized tip for this workout:`;

    const tip = await callOllama(prompt, systemPrompt);
    res.json({ tip: tip.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama workout tip error:", error.message);
    res.json({
      tip: null,
      fallbackTip: "Remember to warm up before exercise and cool down after. Stay hydrated!",
      error: error.message,
      ollamaStatus: "error",
    });
  }
};

// Chat with fitness AI
exports.fitnessChat = async (req, res) => {
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
          : "I'm sorry, the AI service is currently offline. Please make sure Ollama is running on your computer.",
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are FitCoach, a friendly fitness AI assistant. Help users with exercise questions, workout planning, sport recommendations, and fitness tips. Be encouraging and practical. Keep responses concise but helpful (3-4 sentences max). If asked about medical conditions or injuries, recommend consulting a healthcare professional. Do not use markdown formatting.`;

    let prompt = message;
    if (context) {
      prompt = `Context: User has burned ${context.totalCalories || 0} calories this week (goal: ${context.weeklyGoal || 2000}). Recent activities: ${context.recentActivities || "None"}.\n\nUser question: ${message}`;
    }

    const response = await callOllama(prompt, systemPrompt);
    res.json({ response: response.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama fitness chat error:", error.message);
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

// Default recommendations when Ollama is unavailable
function getDefaultRecommendations(fitnessLevel, goals) {
  const recommendations = {
    beginner: {
      "weight-loss": [
        { sport: "Walking", reason: "Low impact, easy to start, burns calories steadily" },
        { sport: "Swimming", reason: "Full body workout, gentle on joints" },
        { sport: "Cycling", reason: "Great cardio, adjustable intensity" },
      ],
      "muscle-building": [
        { sport: "Bodyweight Training", reason: "Build foundation without equipment" },
        { sport: "Resistance Bands", reason: "Gradual strength building" },
        { sport: "Yoga", reason: "Builds core strength and flexibility" },
      ],
      "general-fitness": [
        { sport: "Walking", reason: "Simple and effective starting point" },
        { sport: "Yoga", reason: "Improves flexibility and strength" },
        { sport: "Swimming", reason: "Complete body workout" },
      ],
    },
    intermediate: {
      "weight-loss": [
        { sport: "Running/Jogging", reason: "High calorie burn, builds endurance" },
        { sport: "HIIT", reason: "Maximum calorie burn in less time" },
        { sport: "Tennis", reason: "Fun cardio with social element" },
      ],
      "muscle-building": [
        { sport: "Weight Training", reason: "Progressive overload for muscle growth" },
        { sport: "CrossFit", reason: "Functional strength and conditioning" },
        { sport: "Rock Climbing", reason: "Full body strength challenge" },
      ],
      "general-fitness": [
        { sport: "Running", reason: "Versatile cardio option" },
        { sport: "Cycling", reason: "Endurance and leg strength" },
        { sport: "Basketball", reason: "Cardio, agility, and teamwork" },
      ],
    },
    advanced: {
      "weight-loss": [
        { sport: "HIIT Training", reason: "Intense calorie burning" },
        { sport: "Boxing", reason: "High intensity full body workout" },
        { sport: "Rowing", reason: "Total body cardio challenge" },
      ],
      "muscle-building": [
        { sport: "Powerlifting", reason: "Maximum strength development" },
        { sport: "Olympic Weightlifting", reason: "Explosive power and technique" },
        { sport: "Gymnastics", reason: "Ultimate bodyweight mastery" },
      ],
      "general-fitness": [
        { sport: "Triathlon Training", reason: "Complete fitness challenge" },
        { sport: "Martial Arts", reason: "Discipline, strength, and agility" },
        { sport: "CrossFit", reason: "Varied functional fitness" },
      ],
    },
  };

  const level = fitnessLevel || "beginner";
  const goal = goals || "general-fitness";

  return recommendations[level]?.[goal] || recommendations.beginner["general-fitness"];
}
