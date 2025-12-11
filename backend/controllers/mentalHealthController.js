const MentalHealth = require("../models/MentalHealth");
const { OpenAI } = require("openai");
const { sendWebPushToUser } = require("../services/notificationService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate AI mental health advice
const generateAIAdvice = async (record) => {
  try {
    const prompt = `
You are a helpful mental health assistant.
A user reports mood: ${record.mood}, Stress level: ${record.stressLevel}.
Give a short friendly advice to improve mental wellbeing.
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    return "Remember to take breaks, breathe deeply, and care for your mental wellbeing!";
  }
};

// Add mental health record
const addMentalHealth = async (req, res) => {
  try {
    const { mood, stressLevel, notes } = req.body;
    if (!mood) return res.status(400).json({ message: "Mood is required" });

    const aiAdvice = await generateAIAdvice({ mood, stressLevel });

    const record = new MentalHealth({
      userId: req.user._id,
      mood,
      stressLevel,
      notes,
      aiAdvice
    });

    await record.save();

    await sendWebPushToUser(req.user._id, {
      title: "Mental Health Update",
      body: aiAdvice,
      url: "/mental-health"
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all mental health records
const getMentalHealth = async (req, res) => {
  try {
    const records = await MentalHealth.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addMentalHealth, getMentalHealth };
