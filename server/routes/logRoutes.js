const express = require("express");
const router = express.Router();

const { generateBaseline } = require("../scripts/baselineGenerator");
const Log = require("../models/Log");
const Alert = require("../models/Alert");
const User = require("../models/User");
const { detectAnomaly } = require("../services/mlService");


const fs = require("fs");
const path = require("path");

let normalTrainingData = {};

const loadNormalTrainingData = () => {
  const logsPath = path.join(
    __dirname,
    "../../dataset/normal_logs.json"
  );

  const raw = fs.readFileSync(logsPath, "utf-8");
  const logs = JSON.parse(raw);

  logs.forEach(log => {
    if (!normalTrainingData[log.user_id]) {
      normalTrainingData[log.user_id] = [];
    }
    normalTrainingData[log.user_id].push(log);
  });

  console.log("✅ Normal training data loaded");
};

loadNormalTrainingData();

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
        risk_level: mlResult.risk_level, 
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
      user_id: randomUser.user_id,
      sensitive_access: false
    }).limit(20);

    if (!recentLogs.length) {
      return res.status(400).json({
        error: "No baseline logs found for user"
      });
    }

    const avgLogin =
      recentLogs.reduce((a, b) => a + b.login_hour, 0) /
      recentLogs.length;

    const avgFiles =
      recentLogs.reduce((a, b) => a + b.files_accessed, 0) /
      recentLogs.length;

    const avgDownload =
      recentLogs.reduce((a, b) => a + b.download_mb, 0) /
      recentLogs.length;

    const stdLogin = Math.sqrt(
      recentLogs.reduce((a, b) => a + Math.pow(b.login_hour - avgLogin, 2), 0) /
      recentLogs.length
    );

    const stdFiles = Math.sqrt(
      recentLogs.reduce((a, b) => a + Math.pow(b.files_accessed - avgFiles, 2), 0) /
      recentLogs.length
    );

    const stdDownload = Math.sqrt(
      recentLogs.reduce((a, b) => a + Math.pow(b.download_mb - avgDownload, 2), 0) /
      recentLogs.length
    );

    const riskBands = [
      { label: "low", min: 3, max: 5 },
      { label: "moderate", min: 6, max: 9 },
      { label: "high", min: 12, max: 18 }
    ];

    const selectedRisk =
      riskBands[Math.floor(Math.random() * riskBands.length)];

    const randomZ = () =>
      selectedRisk.min +
      Math.random() * (selectedRisk.max - selectedRisk.min);

    const attackLog = {
      log_id: "attack_" + Date.now(),
      timestamp: new Date(),
      user_id: randomUser.user_id,

      login_hour:
        avgLogin + (stdLogin || 1) * (Math.random() > 0.5 ? randomZ() : -randomZ()),

      files_accessed:
        avgFiles + (stdFiles || 1) * randomZ(),

      download_mb:
        avgDownload + (stdDownload || 1) * randomZ(),

      ip_address: `201.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      device_id: "HACK_" + Math.floor(Math.random() * 1000),
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
        risk_level: mlResult.risk_level, 
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



router.post("/simulate-normal", async (req, res) => {
  try {
    const users = await User.find();
    if (!users.length) {
      return res.status(400).json({ error: "No users found" });
    }

    const randomUser =
      users[Math.floor(Math.random() * users.length)];

    const userNormalLogs =
      normalTrainingData[randomUser.user_id];

    if (!userNormalLogs || !userNormalLogs.length) {
      return res.status(400).json({
        error: "No training normal logs found for user"
      });
    }

    // Randomly sample a real training-normal log
    const baseLog =
      userNormalLogs[
        Math.floor(Math.random() * userNormalLogs.length)
      ];

    // Tiny noise to avoid exact duplication
    const normalLog = {
      log_id: "normal_" + Date.now(),
      timestamp: new Date(),
      user_id: randomUser.user_id,

      login_hour:
        baseLog.login_hour + (Math.random() * 0.3 - 0.15),

      files_accessed:
        baseLog.files_accessed + (Math.random() * 1 - 0.5),

      download_mb:
        baseLog.download_mb + (Math.random() * 3 - 1.5),

      ip_address: randomUser.primary_ip,
      device_id: randomUser.primary_device,
      sensitive_access: false,

      primary_ip: randomUser.primary_ip,
      secondary_ip: randomUser.secondary_ip,
      primary_device: randomUser.primary_device,
      secondary_device: randomUser.secondary_device
    };

    console.log("===== NORMAL LOG SENT TO ML =====");
    console.log(normalLog);

    const log = await Log.create(normalLog);
    const mlResult = await detectAnomaly(normalLog);

    console.log("===== ML RESULT (NORMAL SIMULATION) =====");
    console.log(mlResult);

    if (mlResult && mlResult.prediction === -1) {
      await Alert.create({
        log_id: log.log_id,
        user_id: log.user_id,
        timestamp: log.timestamp,
        anomaly_score: mlResult.anomaly_score,
        prediction: mlResult.prediction,
        risk_level: mlResult.risk_level,
        feature_breakdown: mlResult.feature_breakdown
      });
    }

    res.json({
      success: true,
      normalLog,
      mlResult
    });

  } catch (err) {
    console.error("Normal Simulation Error:", err.message);
    res.status(500).json({ error: "Simulation failed" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const logs = await Log.find({
      user_id: userId,
      timestamp: { $gte: fromDate }
    }).sort({ timestamp: -1 });

    if (!logs.length) {
      return res.json({
        summary: {
          total_sessions: 0,
          total_anomalies: 0,
          avg_login_hour: 0,
          total_download: 0
        },
        logs: []
      });
    }

    const totalSessions = logs.length;
    const totalAnomalies = logs.filter(l => l.sensitive_access).length;

    const avgLogin =
      logs.reduce((a, b) => a + b.login_hour, 0) / totalSessions;

    const totalDownload =
      logs.reduce((a, b) => a + b.download_mb, 0);

    res.json({
      summary: {
        total_sessions: totalSessions,
        total_anomalies: totalAnomalies,
        avg_login_hour: avgLogin.toFixed(2),
        total_download: totalDownload.toFixed(2)
      },
      logs
    });

  } catch (err) {
    console.error("User Activity Error:", err.message);
    res.status(500).json({ error: "Failed to fetch user activity" });
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
