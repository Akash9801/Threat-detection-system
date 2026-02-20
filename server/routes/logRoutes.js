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

    const mlResult = await detectAnomaly(log);

    console.log("===== ML RESULT (NORMAL LOG) =====");
    console.log(mlResult);
    console.log("===================================");

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
    console.error("Create Log Error:", err.message);
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

    const randomUser =
      users[Math.floor(Math.random() * users.length)];

    const recentLogs = await Log.find({
      user_id: randomUser.user_id
    }).limit(20);

    if (!recentLogs.length) {
      return res.status(400).json({
        error: "No baseline logs found for user"
      });
    }

    const extremeFactor =
      20 + Math.random() * 20;

    const attackLog = {
      log_id: "attack_" + Date.now(),
      timestamp: new Date(),
      user_id: randomUser.user_id,

      login_hour:
        Math.random() > 0.5
          ? Math.random() * 2
          : 22 + Math.random() * 1.5,

      files_accessed:
        randomUser.mu_files * extremeFactor,

      download_mb:
        randomUser.mu_download * (extremeFactor + 5),

      ip_address: `201.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,

      device_id:
        "HACK_" + Math.floor(Math.random() * 10000),

      sensitive_access: true,

      primary_ip: randomUser.primary_ip,
      secondary_ip: randomUser.secondary_ip,
      primary_device: randomUser.primary_device,
      secondary_device: randomUser.secondary_device
    };

    console.log("===== ATTACK LOG SENT TO ML =====");
    console.log(attackLog);
    console.log("==================================");

    const log = await Log.create(attackLog);

    const mlResult = await detectAnomaly(attackLog);

    console.log("===== ML RESULT (SIMULATION) =====");
    console.log(mlResult);
    console.log("===================================");

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

    res.json({
      success: true,
      attackLog,
      mlResult
    });

  } catch (err) {
    console.error("Simulation Error:", err.message);
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
