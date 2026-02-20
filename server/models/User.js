const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  name: String,
  department: String,
  primary_ip: String,
  secondary_ip: String,
  primary_device: String,
  secondary_device: String,
  mu_login: Number,
  mu_files: Number,
  mu_download: Number
});

module.exports = mongoose.model("User", userSchema);
