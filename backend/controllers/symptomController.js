// controllers/symptomController.js
const Symptom = require("../models/Symptom");
const User = require("../models/User");
const { OpenAI } = require("openai");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Add a new symptom and get AI recommendation
 */
const addSymptom = async (req, res) => {
  try {
    const { symptom, severity } = req.body;
    const userId = req.user._id;

    // Save symptom to DB
    const newSymptom = await Symptom.create({ userId, symptom, severity });

    // Call AI to provide advice based on symptom
    let aiAdvice = "";
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful health assistant."
          },
          {
            role: "user",
            content: `User reports symptom: "${symptom}" with severity "${severity}". Provide a short advice for home care or when to see a doctor.`
          }
        ],
        temperature: 0.7
      });

      aiAdvice = response.choices[0].message.content;
    } catch (aiErr) {
      console.error("AI error:", aiErr);
      aiAdvice = "Unable to generate AI advice at this time.";
    }

    res.status(201).json({
      success: true,
      symptom: newSymptom,
      aiAdvice
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get all symptoms for the logged-in user
 */
const getSymptoms = async (req, res) => {
  try {
    const symptoms = await Symptom.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ success: true, symptoms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { addSymptom, getSymptoms };
