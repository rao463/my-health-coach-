const Symptom = require("../models/Symptom");
const Medication = require("../models/Medication");
const Nutrition = require("../models/Nutrition");
const Fitness = require("../models/Fitness");
const MentalHealth = require("../models/MentalHealth");
const HealthRecord = require("../models/HealthRecord");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: Generate AI summary for a category
const generateAISummary = async (categoryName, items) => {
  if (!items || items.length === 0) return "";
  const itemList = items.map(i => i.description || i.symptom || i.name || i.activityType || i.mood || i.recordType).join(", ");
  const prompt = `Provide a short, friendly summary and suggestions for wellness based on the user's ${categoryName}: ${itemList}.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful health assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error(`OpenAI API Error for ${categoryName}:`, err.message);
    return "";
  }
};

// GET dashboard data with AI summaries
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [symptoms, medications, nutrition, fitness, mentalHealth, healthRecords] = await Promise.all([
      Symptom.find({ userId }).sort({ date: -1 }).limit(5),
      Medication.find({ userId }).sort({ startDate: 1 }).limit(5),
      Nutrition.find({ userId }).sort({ date: -1 }).limit(5),
      Fitness.find({ userId }).sort({ date: -1 }).limit(5),
      MentalHealth.find({ userId }).sort({ date: -1 }).limit(5),
      HealthRecord.find({ userId }).sort({ date: -1 }).limit(5),
    ]);

    // Generate AI summaries for each category
    const [symptomsAI, medicationsAI, nutritionAI, fitnessAI, mentalAI, healthRecordsAI] = await Promise.all([
      generateAISummary("symptoms", symptoms),
      generateAISummary("medications", medications),
      generateAISummary("nutrition", nutrition),
      generateAISummary("fitness", fitness),
      generateAISummary("mental health", mentalHealth),
      generateAISummary("health records", healthRecords),
    ]);

    res.json({
      symptoms, symptomsAI,
      medications, medicationsAI,
      nutrition, nutritionAI,
      fitness, fitnessAI,
      mentalHealth, mentalAI,
      healthRecords, healthRecordsAI
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboard };
