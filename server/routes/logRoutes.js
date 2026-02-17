const express = require("express");
const router = express.Router();
const { generateBaseline } = require("../scripts/baselineGenerator");
const Log = require("../models/Log");
const Alert = require("../models/Alert");
const User = require("../models/User");
const { detectAnomaly } = require("../services/mlService");

router.post("/", async (req, res) => {
  try {
    const log = await Log.create(req.body);

    const mlResult = await detectAnomaly(req.body);

    if (mlResult && mlResult.prediction === -1) {
      await Alert.create({
        log_id: log.log_id,
        user_id: log.user_id,
        timestamp: log.timestamp,
        anomaly_score: mlResult.anomaly_score,
        prediction: mlResult.prediction,
        feature_breakdown: mlResult.feature_breakdown
      });
    }

    res.status(201).json({ success: true, log, mlResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const logs = await Log.countDocuments();
    const anomalies = await Alert.countDocuments();

    res.json({ users, logs, anomalies });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ user_id: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/simulate", async (req, res) => {
  try {
    const users = await User.find();

    if (!users.length) {
      return res.status(400).json({ error: "No users found" });
    }

    const randomUser = users[Math.floor(Math.random() * users.length)];

    const attackLog = {
      log_id: "attack_" + Date.now(),
      timestamp: new Date(),
      user_id: randomUser.user_id,
      login_hour: 2,
      files_accessed: 300,
      download_mb: 1500,
      ip_address: "99.99.99.99",
      device_id: "UNKNOWN_DEVICE",
      sensitive_access: true
    };

    const log = await Log.create(attackLog);

    const features = [
      attackLog.login_hour,
      attackLog.files_accessed,
      attackLog.download_mb,
      1,
      1
    ];

    const mlResult = await detectAnomaly(features);

    if (mlResult.isAnomaly) {
      await Alert.create({
        log_id: log.log_id,
        user_id: log.user_id,
        timestamp: log.timestamp,
        anomaly_score: mlResult.score,
        threshold: mlResult.threshold
      });
    }

    res.json({
      success: true,
      attackLog,
      mlResult
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Simulation failed" });
  }
});

router.post("/baseline", async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await generateBaseline(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
