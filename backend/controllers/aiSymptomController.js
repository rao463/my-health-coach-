const ollama = require("ollama").default;

const handleSymptomCheck = async (req, res) => {
  try {
    const { symptoms } = req.body;

    // Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: "Symptoms are required" });
    }

    const prompt = `
User reports these symptoms:
${symptoms.join(", ")}

Give safe medical advice.
Do NOT diagnose.
Suggest when to see a doctor.
`;

    // Ollama call
    const response = await ollama.chat({
      model: "gemma3:1b",
      messages: [
        { role: "system", content: "You are a helpful medical assistant." },
        { role: "user", content: prompt }
      ],
    });

    res.json({
      advice: response.message.content,
    });

  } catch (err) {
    console.error("Ollama error:", err);
    res.status(500).json({
      error: "Symptom check failed",
      details: err.message,
    });
  }
};

module.exports = { handleSymptomCheck };


