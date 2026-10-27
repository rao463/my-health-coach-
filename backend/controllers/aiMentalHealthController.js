// AI Mental Health Controller - Uses Ollama for local AI-powered mental wellness support

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
        console.log(`Using Ollama model for mental health: ${cachedModel}`);
        return cachedModel;
      }
    }

    // Use first available model if no preferred found
    cachedModel = models[0].name;
    console.log(`Using Ollama model for mental health: ${cachedModel}`);
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
      num_predict: 400,
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

// Get personalized wellness recommendations based on assessment
exports.getWellnessRecommendations = async (req, res) => {
  try {
    const {
      currentMood,
      stressLevel,
      sleepQuality,
      energyLevel,
      mainConcerns,
      recentActivities,
    } = req.body;

    // Check if Ollama is running
    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        recommendations: null,
        fallbackRecommendations: getDefaultRecommendations(currentMood, stressLevel),
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are MindCoach, a compassionate and supportive mental wellness AI assistant. Based on the user's current mental state assessment, provide 3-4 personalized, practical recommendations to support their emotional well-being. Be warm, empathetic, and encouraging. Include specific techniques they can try right now. Do not diagnose conditions or replace professional help - if concerns are serious, gently suggest seeking professional support. Keep responses concise and actionable. Do not use markdown formatting.`;

    let prompt = `Based on this mental wellness assessment, provide personalized recommendations:\n\n`;
    prompt += `Current Mood: ${currentMood || "Not specified"}\n`;
    prompt += `Stress Level: ${stressLevel || "Not specified"}/10\n`;
    prompt += `Sleep Quality: ${sleepQuality || "Not specified"}\n`;
    prompt += `Energy Level: ${energyLevel || "Not specified"}\n`;

    if (mainConcerns) {
      prompt += `Main Concerns: ${mainConcerns}\n`;
    }
    if (recentActivities) {
      prompt += `Recent Self-Care Activities: ${recentActivities}\n`;
    }

    prompt += `\nProvide 3-4 personalized wellness recommendations with brief explanations:`;

    const recommendations = await callOllama(prompt, systemPrompt);
    res.json({ recommendations: recommendations.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama wellness recommendations error:", error.message);
    res.json({
      recommendations: null,
      fallbackRecommendations: getDefaultRecommendations(req.body.currentMood, req.body.stressLevel),
      error: error.message,
      ollamaStatus: "error",
    });
  }
};

// Get guided exercise based on user's needs
exports.getGuidedExercise = async (req, res) => {
  try {
    const { exerciseType, duration, currentState } = req.body;

    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        exercise: null,
        fallbackExercise: getDefaultExercise(exerciseType),
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are MindCoach, a calming mental wellness guide. Provide a step-by-step guided exercise that the user can follow along. Be soothing and clear in your instructions. Keep the exercise practical and achievable. Do not use markdown formatting - use numbered steps.`;

    let prompt = `Create a ${duration || "5"}-minute guided ${exerciseType || "relaxation"} exercise for someone who is feeling ${currentState || "stressed"}. Provide clear, step-by-step instructions:`;

    const exercise = await callOllama(prompt, systemPrompt);
    res.json({ exercise: exercise.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama guided exercise error:", error.message);
    res.json({
      exercise: null,
      fallbackExercise: getDefaultExercise(req.body.exerciseType),
      error: error.message,
      ollamaStatus: "error",
    });
  }
};

// Get coping strategy for specific situation
exports.getCopingStrategy = async (req, res) => {
  try {
    const { situation, emotion, intensity } = req.body;

    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        strategy: null,
        fallbackStrategy: "Take a few deep breaths. Remember that this feeling is temporary. Focus on what you can control right now.",
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are MindCoach, a supportive mental wellness assistant. Provide a brief, practical coping strategy for the user's current situation. Be compassionate and offer actionable steps. Keep it to 2-3 sentences. Do not use markdown formatting.`;

    const prompt = `The user is feeling ${emotion} (intensity: ${intensity}/10) about: ${situation}. Provide a brief, helpful coping strategy:`;

    const strategy = await callOllama(prompt, systemPrompt);
    res.json({ strategy: strategy.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama coping strategy error:", error.message);
    res.json({
      strategy: null,
      fallbackStrategy: "Take a few deep breaths. Remember that this feeling is temporary. Focus on what you can control right now.",
      error: error.message,
      ollamaStatus: "error",
    });
  }
};

// Chat with mental health AI - with conversation memory
exports.mentalHealthChat = async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        response: health.online
          ? "No AI model found. Please run 'ollama pull llama3' to download a model."
          : "Hey, I'm having a bit of trouble connecting right now. But I want you to know - whatever you're going through, you're not alone. Please try again in a moment, okay?",
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are Maya, a warm, caring, and empathetic mental wellness companion. You talk like a supportive best friend who genuinely cares about the person you're speaking with.

Your personality:
- You're warm, gentle, and naturally conversational - like texting with a close friend
- You use casual, friendly language (contractions like "I'm", "you're", "that's")
- You show genuine interest and REMEMBER what they share with you throughout the conversation
- You validate their feelings before offering any advice
- You ask thoughtful questions to understand them better
- You share gentle encouragement and remind them of their strength
- You sometimes use gentle phrases like "I hear you", "That sounds really tough", "I'm here with you"

Important guidelines:
- ALWAYS reference previous things they've shared when relevant - this shows you're truly listening
- If they mentioned something earlier (like a problem at work, a relationship issue, etc.), bring it up naturally
- Always acknowledge their feelings first - make them feel heard
- Be conversational, not clinical or formal
- Ask follow-up questions to show you care about their full story
- Offer gentle suggestions, not commands (e.g., "Have you tried..." instead of "You should...")
- If they seem very distressed or mention self-harm, gently and caringly encourage them to reach out to a professional or someone they trust, while still being supportive
- Never diagnose or prescribe - you're a supportive friend, not a doctor
- Keep responses warm and natural (3-5 sentences usually)
- Don't use bullet points or formal formatting - speak naturally
- End with something encouraging or a caring question when appropriate

Remember: You're Maya, their supportive friend who's always here to listen. Pay attention to the conversation history to provide continuity and show you remember what they've shared.`;

    // Build messages array with conversation history for context
    const model = await getAvailableModel();
    if (!model) {
      throw new Error("No Ollama model available");
    }

    const messages = [{ role: "system", content: systemPrompt }];

    // Add context about user's current state if provided
    if (context && (context.currentMood || context.stressLevel)) {
      messages.push({
        role: "system",
        content: `[Current user state - Mood: ${context.currentMood || "not shared"}, Stress level: ${context.stressLevel || "not shared"}/10. Use this context naturally if relevant.]`
      });
    }

    // Add conversation history (last 10 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content
        });
      }
    }

    // Add the current message
    messages.push({ role: "user", content: message });

    // Call Ollama with full conversation context
    const response = await ollama.chat({
      model: model,
      messages: messages,
      stream: false,
      options: {
        temperature: 0.8,
        num_predict: 500,
      },
    });

    const aiResponse = response.message?.content || "";
    res.json({ response: aiResponse.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama mental health chat error:", error.message);
    res.json({
      response: "Oh no, something went a bit wonky on my end! But hey, I'm still thinking of you. Take a deep breath, and let's try that again in a moment, okay?",
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
function getDefaultRecommendations(mood, stressLevel) {
  const recommendations = [];

  if (stressLevel >= 7) {
    recommendations.push({
      title: "Deep Breathing Exercise",
      description: "Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7, exhale for 8. Repeat 3-4 times.",
    });
    recommendations.push({
      title: "Grounding Technique",
      description: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    });
  }

  if (mood === "sad" || mood === "anxious") {
    recommendations.push({
      title: "Gentle Movement",
      description: "A short 5-10 minute walk can help shift your mood and clear your mind.",
    });
    recommendations.push({
      title: "Reach Out",
      description: "Consider talking to a friend, family member, or support person about how you're feeling.",
    });
  }

  recommendations.push({
    title: "Mindful Moment",
    description: "Take 2 minutes to focus only on your breath. Notice each inhale and exhale without judgment.",
  });

  recommendations.push({
    title: "Gratitude Practice",
    description: "Write down 3 things you're grateful for today, no matter how small.",
  });

  return recommendations.slice(0, 4);
}

// Default exercises when Ollama is unavailable
function getDefaultExercise(type) {
  const exercises = {
    breathing: `Deep Breathing Exercise (5 minutes)

1. Find a comfortable seated position and close your eyes
2. Take a deep breath in through your nose for 4 counts
3. Hold your breath gently for 4 counts
4. Exhale slowly through your mouth for 6 counts
5. Repeat this cycle 5-10 times
6. Notice how your body feels more relaxed with each breath
7. When ready, slowly open your eyes`,

    meditation: `Simple Mindfulness Meditation (5 minutes)

1. Sit comfortably with your back straight but relaxed
2. Close your eyes and take three deep breaths
3. Let your breathing return to normal
4. Focus your attention on your breath
5. When thoughts arise, acknowledge them and gently return focus to breathing
6. If your mind wanders, that's okay - just bring it back
7. Continue for 5 minutes, then slowly open your eyes`,

    grounding: `5-4-3-2-1 Grounding Exercise

1. Look around and name 5 things you can SEE
2. Notice and name 4 things you can TOUCH
3. Listen for 3 things you can HEAR
4. Identify 2 things you can SMELL
5. Notice 1 thing you can TASTE
6. Take a deep breath and notice how you feel
7. You are present, safe, and grounded`,

    relaxation: `Progressive Muscle Relaxation (5 minutes)

1. Start with your feet - tense the muscles for 5 seconds, then release
2. Move to your calves - tense and release
3. Continue with thighs, then stomach muscles
4. Tense and release your hands and arms
5. Scrunch your shoulders up to your ears, hold, then release
6. Finally, tense your face muscles, then relax
7. Take a few deep breaths and notice the relaxation in your body`,
  };

  return exercises[type] || exercises.breathing;
}
