const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { addHealthRecord, getHealthRecords } = require("../controllers/healthRecordController");

router.post("/add", protect, addHealthRecord);
router.get("/", protect, getHealthRecords);

module.exports = router;





