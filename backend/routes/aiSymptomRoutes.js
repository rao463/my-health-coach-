const express = require("express");
const router = express.Router();
const { handleSymptomCheck } = require("../controllers/aiSymptomController");

// ✅ SYMPTOM CHECKER
router.post("/symptoms", handleSymptomCheck);

module.exports = router;
