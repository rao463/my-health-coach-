// AI Health Record Controller - Uses Ollama for health record guidance with Maya

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
        console.log(`Using Ollama model for health records: ${cachedModel}`);
        return cachedModel;
      }
    }

    // Use first available model if no preferred found
    cachedModel = models[0].name;
    console.log(`Using Ollama model for health records: ${cachedModel}`);
    return cachedModel;
  } catch (error) {
    console.error("Failed to get models:", error.message);
    return null;
  }
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

// Chat with Maya about health records - with conversation memory
exports.healthRecordChat = async (req, res) => {
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
          : "Hey, I'm having a bit of trouble connecting right now. But I want you to know - your health records are safe. Please try again in a moment!",
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are Maya, a warm, caring, and knowledgeable health records assistant. You help users understand and manage their personal health information.

Your personality:
- You're warm, friendly, and naturally conversational - like a helpful healthcare advocate
- You use clear, simple language to explain medical terms and lab results
- You show genuine care and REMEMBER what they share with you throughout the conversation
- You're patient and thorough when explaining health information
- You encourage users to discuss concerns with their healthcare providers

Your expertise includes helping with:
- Explaining lab results and what values mean (high, low, normal ranges)
- Understanding medications, dosages, and potential interactions
- Interpreting medical history and identifying patterns
- Explaining medical terminology in simple terms
- Helping organize and track health information
- Providing general wellness guidance

Important guidelines:
- ALWAYS reference previous things they've shared when relevant
- Be clear and educational when explaining medical information
- NEVER diagnose conditions - always recommend consulting a healthcare provider for diagnoses
- NEVER prescribe medications or change dosages - that's for doctors only
- If something seems urgent or concerning, gently encourage them to contact their doctor
- Help them prepare questions for their healthcare provider
- Be supportive and reassuring while being honest about limitations
- Keep responses helpful and conversational (3-5 sentences usually)
- Don't use bullet points or formal formatting - speak naturally

Remember: You're Maya, their supportive health records guide who helps them understand their health information while always encouraging professional medical consultation for serious concerns.`;

    // Build messages array with conversation history for context
    const model = await getAvailableModel();
    if (!model) {
      throw new Error("No Ollama model available");
    }

    const messages = [{ role: "system", content: systemPrompt }];

    // Add context about user's health records if provided
    if (context) {
      let contextMsg = "[User's health record context:\n";
      if (context.recentLabResults) {
        contextMsg += `Recent lab results: ${context.recentLabResults}\n`;
      }
      if (context.medications) {
        contextMsg += `Current medications: ${context.medications}\n`;
      }
      if (context.conditions) {
        contextMsg += `Medical conditions: ${context.conditions}\n`;
      }
      if (context.recentRecords) {
        contextMsg += `Recent records: ${context.recentRecords}\n`;
      }
      contextMsg += "Use this context naturally if relevant.]";
      messages.push({ role: "system", content: contextMsg });
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
        temperature: 0.7,
        num_predict: 500,
      },
    });

    const aiResponse = response.message?.content || "";
    res.json({ response: aiResponse.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Ollama health record chat error:", error.message);
    res.json({
      response: "Oh, I ran into a small hiccup! Don't worry though - your health records are safe. Let's try that again in just a moment.",
      error: error.message,
      ollamaStatus: "error",
    });
  }
};

// Explain a lab result
exports.explainLabResult = async (req, res) => {
  try {
    const { testName, value, unit, referenceRange, notes } = req.body;

    if (!testName) {
      return res.status(400).json({ error: "Test name is required" });
    }

    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        explanation: null,
        fallbackExplanation: "This lab result measures an important health marker. Please consult your healthcare provider for a detailed explanation of what this result means for you.",
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are Maya, a friendly health records assistant. Explain lab results in simple, easy-to-understand terms. Be reassuring but honest. Always recommend discussing results with a healthcare provider. Keep explanations brief (3-4 sentences). Don't use markdown formatting.`;

    let prompt = `Please explain this lab result in simple terms:\n`;
    prompt += `Test: ${testName}\n`;
    if (value) prompt += `Value: ${value}${unit ? ` ${unit}` : ""}\n`;
    if (referenceRange) prompt += `Reference Range: ${referenceRange}\n`;
    if (notes) prompt += `Notes: ${notes}\n`;
    prompt += `\nProvide a brief, friendly explanation of what this test measures and what the result might indicate:`;

    const model = await getAvailableModel();
    const response = await ollama.chat({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      stream: false,
      options: { temperature: 0.7, num_predict: 300 },
    });

    res.json({ explanation: response.message?.content?.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Lab result explanation error:", error.message);
    res.json({
      explanation: null,
      fallbackExplanation: "This lab result measures an important health marker. Please consult your healthcare provider for a detailed explanation.",
      error: error.message,
      ollamaStatus: "error",
    });
  }
};

// Explain a medication
exports.explainMedication = async (req, res) => {
  try {
    const { medicationName, dosage, frequency, purpose } = req.body;

    if (!medicationName) {
      return res.status(400).json({ error: "Medication name is required" });
    }

    const health = await checkOllamaHealth();
    if (!health.online || !health.hasModel) {
      return res.json({
        explanation: null,
        fallbackExplanation: "Please consult your pharmacist or healthcare provider for detailed information about this medication.",
        ollamaStatus: health.online ? "no-model" : "offline",
      });
    }

    const systemPrompt = `You are Maya, a friendly health records assistant. Provide general information about medications in simple terms. NEVER advise changing dosages or stopping medications - always recommend consulting a doctor or pharmacist. Include general purpose and common considerations. Keep explanations brief (3-4 sentences). Don't use markdown formatting.`;

    let prompt = `Please provide general information about this medication:\n`;
    prompt += `Medication: ${medicationName}\n`;
    if (dosage) prompt += `Dosage: ${dosage}\n`;
    if (frequency) prompt += `Frequency: ${frequency}\n`;
    if (purpose) prompt += `Purpose: ${purpose}\n`;
    prompt += `\nProvide a brief, helpful overview:`;

    const model = await getAvailableModel();
    const response = await ollama.chat({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      stream: false,
      options: { temperature: 0.7, num_predict: 300 },
    });

    res.json({ explanation: response.message?.content?.trim(), ollamaStatus: "online" });
  } catch (error) {
    console.error("Medication explanation error:", error.message);
    res.json({
      explanation: null,
      fallbackExplanation: "Please consult your pharmacist or healthcare provider for detailed information about this medication.",
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
