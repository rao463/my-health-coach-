const Nutrition = require("../models/Nutrition");
const { OpenAI } = require("openai");
const { sendWebPushToUser } = require("../services/notificationService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate AI advice for nutrition
const generateAIAdvice = async (nutrition) => {
  try {
    const prompt = `
You are a helpful health assistant.
A user ate: ${nutrition.food}, Calories: ${nutrition.calories}.
Provide a short friendly advice or tip for this meal.
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    return "Keep tracking your meals to maintain a healthy diet!";
  }
};

// Add nutrition record
const addNutrition = async (req, res) => {
  try {
    const { food, calories, date, notes } = req.body;
    if (!food || !calories) {
      return res.status(400).json({ message: "Food and calories are required" });
    }

    const aiAdvice = await generateAIAdvice({ food, calories });

    const nutrition = new Nutrition({
      userId: req.user._id,
      food,
      calories,
      date: date || Date.now(),
      notes,
      aiAdvice
    });

    await nutrition.save();

    // Send push notification
    await sendWebPushToUser(req.user._id, {
      title: "New Nutrition Record Added",
      body: aiAdvice,
      url: "/nutrition"
    });

    res.status(201).json(nutrition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all nutrition records for user
const getNutrition = async (req, res) => {
  try {
    const records = await Nutrition.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addNutrition, getNutrition };
