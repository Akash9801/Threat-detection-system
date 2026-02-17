const Log = require("../models/Log");
const User = require("../models/User");

async function generateBaseline() {
  const users = await User.find();

  if (!users.length) {
    return { message: "No users found" };
  }

  // Clear existing baseline logs
  await Log.deleteMany({ sensitive_access: false });

  const baselineLogs = [];

  for (const user of users) {
    for (let day = 0; day < 7; day++) {
      // Shift 1 (Morning)
      baselineLogs.push({
        log_id: "baseline_" + Date.now() + "_" + Math.random(),
        timestamp: new Date(),
        user_id: user.user_id,
        login_hour: 9 + Math.floor(Math.random() * 2), // 9–10
        files_accessed: 10 + Math.floor(Math.random() * 10), // 10–19
        download_mb: 80 + Math.floor(Math.random() * 40), // 80–119
        ip_address: "192.168.1.10",
        device_id: "DEV883",
        sensitive_access: false
      });

      // Shift 2 (Afternoon)
      baselineLogs.push({
        log_id: "baseline_" + Date.now() + "_" + Math.random(),
        timestamp: new Date(),
        user_id: user.user_id,
        login_hour: 14 + Math.floor(Math.random() * 2), // 14–15
        files_accessed: 12 + Math.floor(Math.random() * 10), // 12–21
        download_mb: 90 + Math.floor(Math.random() * 50), // 90–139
        ip_address: "192.168.1.10",
        device_id: "DEV883",
        sensitive_access: false
      });
    }
  }

  await Log.insertMany(baselineLogs);

  return {
    message: "Baseline generated successfully",
    total_logs_created: baselineLogs.length
  };
}

module.exports = { generateBaseline };
