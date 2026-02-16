const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  log_id: String,
  user_id: String,
  timestamp: Date,
  anomaly_score: Number,
  prediction: Number,
  feature_breakdown: Object
});

module.exports = mongoose.model("Alert", alertSchema);
