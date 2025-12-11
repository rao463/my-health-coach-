const Fitness = require("../models/Fitness");
const { OpenAI } = require("openai");
const { sendWebPushToUser } = require("../services/notificationService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate AI fitness recommendation
const generateAIRecommendation = async (record) => {
  try {
    const prompt = `
You are a helpful fitness assistant.
A user did: ${record.activityType} for ${record.duration} minutes, calories burned: ${record.caloriesBurned || 'N/A'}.
Provide a short friendly recommendation to improve fitness.
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    return "Keep up your workouts and stay consistent!";
  }
};

// Add fitness record
const addFitness = async (req, res) => {
  try {
    const { activityType, duration, caloriesBurned, notes } = req.body;
    if (!activityType || !duration) return res.status(400).json({ message: "Activity and duration are required" });

    const aiRecommendation = await generateAIRecommendation({ activityType, duration, caloriesBurned });

    const record = new Fitness({
      userId: req.user._id,
      activityType,
      duration,
      caloriesBurned,
      notes,
      aiRecommendation
    });

    await record.save();

    await sendWebPushToUser(req.user._id, {
      title: "New Fitness Record",
      body: aiRecommendation,
      url: "/fitness"
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all fitness records
const getFitness = async (req, res) => {
  try {
    const records = await Fitness.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addFitness, getFitness };
