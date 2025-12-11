// backend/server.js

// Load dependencies
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);


// ---- Import routes ----
const userRoutes = require('./routes/userRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const medicationRoutes = require('./routes/medicationRoutes');

const nutritionRoutes = require('./routes/nutritionRoutes');
const fitnessRoutes  = require('./routes/fitnessRoutes');
const mentalHealthRoutes = require('./routes/mentalHealthRoutes');
const recordRoutes   = require('./routes/healthRecordRoutes');


// ---- Mount routes ----
app.use('/api/users', userRoutes);
app.use("/api/symptoms", require("./routes/symptomRoutes"));
app.use('/api/medications', medicationRoutes);
app.use("/api/nutrition", require("./routes/nutritionRoutes"));
app.use("/api/fitness", require("./routes/fitnessRoutes"));
app.use("/api/mentalhealth", require("./routes/mentalHealthRoutes"));
app.use("/api/healthrecords", require("./routes/healthRecordRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/test-email", require("./routes/testEmail"));
app.use("/api/push", require("./routes/pushSubscriptionRoutes"));






// Root endpoint
app.get('/', (req, res) => {
  res.send('My Health Coach Project Backend is running');
});

// Basic error handler (optional, helpful for debugging)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server error' });
});

// Connect to MongoDB and start server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});



