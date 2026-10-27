const express = require("express");
const router = express.Router();
const aiHealthRecordController = require("../controllers/aiHealthRecordController");

// Health check for Ollama status
router.get("/healthrecord/health", aiHealthRecordController.healthCheck);

// Chat with Maya about health records
router.post("/healthrecord/chat", aiHealthRecordController.healthRecordChat);

// Explain a lab result
router.post("/healthrecord/explain-lab", aiHealthRecordController.explainLabResult);

// Explain a medication
router.post("/healthrecord/explain-medication", aiHealthRecordController.explainMedication);

module.exports = router;
