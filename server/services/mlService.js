const axios = require("axios");

/*
-------------------------------------------------------
DETECT ANOMALY USING FASTAPI ML SERVICE
-------------------------------------------------------
*/
async function detectAnomaly(log) {
  try {
    const response = await axios.post(
      "http://localhost:8000/predict",
      {
        log_id: log.log_id,
        timestamp: log.timestamp instanceof Date
          ? log.timestamp.toISOString()
          : log.timestamp,
        user_id: log.user_id,
        login_hour: log.login_hour,
        files_accessed: log.files_accessed,
        download_mb: log.download_mb,
        ip_address: log.ip_address,
        device_id: log.device_id,
        sensitive_access: log.sensitive_access,
        primary_ip: log.primary_ip,
        secondary_ip: log.secondary_ip,
        primary_device: log.primary_device,
        secondary_device: log.secondary_device
      }
    );

    return response.data;

  } catch (err) {
    console.error(
      "ML Service Error:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { detectAnomaly };
