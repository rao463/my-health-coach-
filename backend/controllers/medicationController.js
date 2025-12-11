const Medication = require("../models/Medication");
const { OpenAI } = require("openai");
const { sendWebPushToUser } = require("../services/notificationService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate AI reminder message
const generateAIReminder = async (med) => {
  try {
    const prompt = `
You are a helpful health assistant.
A user takes the following medication:
Name: ${med.name}, Dosage: ${med.dosage}, Frequency: ${med.frequency}.
Generate a friendly reminder message in 1-2 sentences.
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    return `Reminder: It's time to take your medication ${med.name}.`;
  }
};

// Add medication
const addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, startDate, endDate, notes } = req.body;
    if (!name || !dosage || !frequency || !startDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const aiReminder = await generateAIReminder({ name, dosage, frequency });

    const newMedication = new Medication({
      userId: req.user._id,
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      notes,
      aiReminder
    });

    await newMedication.save();

    // Send push notification
    await sendWebPushToUser(req.user._id, {
      title: "Medication Added",
      body: aiReminder,
      url: "/medication"
    });

    res.status(201).json(newMedication);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all medications for user
const getUserMedications = async (req, res) => {
  try {
    const meds = await Medication.find({ userId: req.user._id }).sort({ startDate: 1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a medication
const deleteMedication = async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medication not found" });
    if (med.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await med.remove();
    res.json({ message: "Medication removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addMedication, getUserMedications, deleteMedication };
