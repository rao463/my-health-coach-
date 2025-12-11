const HealthRecord = require("../models/HealthRecord");
const { OpenAI } = require("openai");
const { sendWebPushToUser } = require("../services/notificationService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate AI advice for health record
const generateAIAdvice = async (record) => {
  try {
    const prompt = `
You are a helpful health assistant.
A user added a health record: Type: ${record.recordType}, Description: ${record.description || 'N/A'}.
Provide a short friendly advice for maintaining good health related to this record.
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    return "Keep tracking your health records for better management!";
  }
};

// Add health record
const addHealthRecord = async (req, res) => {
  try {
    const { recordType, description, fileUrl, notes } = req.body;
    if (!recordType) return res.status(400).json({ message: "Record type is required" });

    const aiAdvice = await generateAIAdvice({ recordType, description });

    const record = new HealthRecord({
      userId: req.user._id,
      recordType,
      description,
      fileUrl,
      notes,
      aiAdvice
    });

    await record.save();

    await sendWebPushToUser(req.user._id, {
      title: "New Health Record Added",
      body: aiAdvice,
      url: "/health-record"
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all health records
const getHealthRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addHealthRecord, getHealthRecords };
