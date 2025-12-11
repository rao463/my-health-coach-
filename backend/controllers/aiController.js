require('dotenv').config();
const OpenAI = require("openai");
const Symptom = require('../models/Symptom');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const symptomChecker = async (req, res) => {
  try {
    const userId = req.user.id;

    const symptoms = await Symptom.find({ userId }).sort({ date: -1 }).limit(5);
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ error: "No symptoms found" });
    }

    const symptomList = symptoms.map(s => s.description || s.symptom).join(", ");
    const prompt = `The user has the following symptoms: ${symptomList}. Suggest possible medical conditions and next steps.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful health assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const aiPrediction = response.choices[0].message.content;

    res.json({ aiPrediction: aiPrediction.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { symptomChecker }; // ✅ Export as object
