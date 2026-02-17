const Log = require("../models/Log");

async function generateBaseline(userId) {
  await Log.deleteMany({ user_id: userId });

  const baselineLogs = [];

  for (let i = 0; i < 20; i++) {
    baselineLogs.push({
      log_id: "baseline_" + Date.now() + "_" + i,
      timestamp: new Date(),
      user_id: userId,
      login_hour: 10,            
      files_accessed: 15,        
      download_mb: 120,          
      ip_address: "192.168.1.10",
      device_id: "DEV883",
      sensitive_access: false
    });
  }

  await Log.insertMany(baselineLogs);

  return { message: "Baseline generated successfully" };
}

module.exports = { generateBaseline };
