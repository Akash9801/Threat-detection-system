const Log = require("../models/Log");
const User = require("../models/User");

function randomGaussian(mean, stdDev) {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

async function generateBaseline() {
  const users = await User.find();

  if (!users.length) {
    return { message: "No users found" };
  }

  await Log.deleteMany({ sensitive_access: false });

  const baselineLogs = [];

  for (const user of users) {
    for (let day = 0; day < 7; day++) {
      for (let session = 0; session < 2; session++) {
        const login_hour = Math.max(
          0,
          Math.min(23.99, randomGaussian(user.mu_login, 0.5))
        );

        const files_accessed = Math.max(
          1,
          randomGaussian(user.mu_files, 5)
        );

        const download_mb = Math.max(
          1,
          randomGaussian(user.mu_download, 15)
        );

        baselineLogs.push({
          log_id: "baseline_" + Date.now() + "_" + Math.random(),
          timestamp: new Date(),
          user_id: user.user_id,
          login_hour,
          files_accessed,
          download_mb,
          ip_address: user.primary_ip,
          device_id: user.primary_device,
          sensitive_access: false
        });
      }
    }
  }

  await Log.insertMany(baselineLogs);

  return {
    message: "Baseline generated successfully",
    total_logs_created: baselineLogs.length
  };
}

module.exports = { generateBaseline };
