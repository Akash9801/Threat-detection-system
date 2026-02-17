const Log = require("../models/Log");
const Alert = require("../models/Alert");
const { detectAnomaly } = require("../services/mlService");
const { generateBaseline } = require("../scripts/baselineGenerator");

exports.createLog = async (req, res) => {
  try {
    const log = await Log.create(req.body);

    const features = [
      req.body.loginHour,
      req.body.filesAccessed,
      req.body.dataDownloadedMB,
      req.body.newIPFlag,
      req.body.newDeviceFlag
    ];

    const mlResult = await detectAnomaly(features);

    if (mlResult.isAnomaly) {
      await Alert.create({
        user_id: req.body.user_id,
        timestamp: new Date(),
        anomaly_score: mlResult.score,
        threshold: mlResult.threshold
      });
    }

    res.status(201).json({
      success: true,
      log,
      mlResult
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.createBaseline = async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await generateBaseline(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
