const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  log_id: String,
  timestamp: Date,
  user_id: String,
  login_hour: Number,
  files_accessed: Number,
  download_mb: Number,
  ip_address: String,
  device_id: String,
  sensitive_access: Boolean
});

module.exports = mongoose.model("Log", logSchema);
