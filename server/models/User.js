const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  name: String,
  department: String,
  primary_ip: String,
  secondary_ip: String,
  primary_device: String,
  secondary_device: String
});

module.exports = mongoose.model("User", userSchema);
