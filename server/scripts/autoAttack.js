require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../models/User");
const Log = require("../models/Log");
const Alert = require("../models/Alert");

mongoose.connect(process.env.MONGO_URI);

async function generateAttack() {
  const users = await User.find();
  const randomUser = users[Math.floor(Math.random() * users.length)];

  const attackLog = {
    log_id: "auto_attack_" + Date.now(),
    timestamp: new Date(),
    user_id: randomUser.user_id,
    login_hour: Math.random() > 0.5 ? 3 : 22,
    files_accessed: 200 + Math.random() * 300,
    download_mb: 1000 + Math.random() * 2000,
    ip_address: "100.100.100.100",
    device_id: "HACK_DEVICE",
    sensitive_access: true
  };

  const log = await Log.create(attackLog);

  const mlRes = await axios.post(process.env.ML_SERVICE_URL, attackLog);

  if (mlRes.data.prediction === -1) {
    await Alert.create({
      log_id: log.log_id,
      user_id: log.user_id,
      timestamp: log.timestamp,
      anomaly_score: mlRes.data.anomaly_score,
      prediction: mlRes.data.prediction,
      feature_breakdown: mlRes.data.feature_breakdown
    });
  }

  console.log("Attack simulated");
  process.exit();
}

generateAttack();
