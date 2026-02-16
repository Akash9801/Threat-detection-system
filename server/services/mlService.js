const axios = require("axios");
const ML_URL = process.env.ML_SERVICE_URL;

exports.predictLog = async (log) => {
  try {
    const res = await axios.post(ML_URL, log);
    return res.data;
  } catch (err) {
    console.error("ML Service Error:", err.message);
    return null;
  }
};
