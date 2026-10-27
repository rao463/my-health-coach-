// backend/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
const OpenAI = require('openai'); // for AI assistant

// Route imports
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const fitnessRoutes = require('./routes/fitnessRoutes');
const mentalHealthRoutes = require('./routes/mentalHealthRoutes');
const healthRecordRoutes = require('./routes/healthRecordRoutes');
const aiSymptomRoutes = require("./routes/aiSymptomRoutes");
const aiNutritionRoutes = require("./routes/aiNutritionRoutes");
const aiFitnessRoutes = require("./routes/aiFitnessRoutes");
const aiMentalHealthRoutes = require("./routes/aiMentalHealthRoutes");
const aiHealthRecordRoutes = require("./routes/aiHealthRecordRoutes");
const pushSubscriptionRoutes = require("./routes/pushSubscriptionRoutes");
const dashboardRoutes = require("./routes/dashboard");

// Start scheduled jobs
const reminderJob = require("./jobs/reminderJob");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/mentalhealth', mentalHealthRoutes);
app.use('/api/healthrecord', healthRecordRoutes);
app.use("/api/ai", aiSymptomRoutes);
app.use("/api/ai", aiNutritionRoutes);
app.use("/api/ai", aiFitnessRoutes);
app.use("/api/ai", aiMentalHealthRoutes);
app.use("/api/ai", aiHealthRecordRoutes);
app.use("/api/push", pushSubscriptionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Optional: AI symptoms endpoint (can call OpenAI or other AI logic)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/ai/symptoms", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ result: reply });
  } catch (err) {
    console.error("AI processing error:", err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// Root endpoint
app.get('/', (req, res) => res.send('My Health Coach Project backend running'));

// MongoDB connect
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Server error' });
});



