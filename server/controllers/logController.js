const Log = require("../models/Log");
const Alert = require("../models/Alert");
const { predictLog } = require("../services/mlService");

exports.createLog = async (req, res) => {
  try {
    const log = await Log.create(req.body);
    const mlResult = await predictLog(req.body);

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
};
