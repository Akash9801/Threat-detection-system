require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    await User.deleteMany({});
    console.log("Old users cleared");

    const usersPath = path.join(__dirname, "../../dataset/users.json");
    const usersData = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

    const usersToInsert = usersData.map(user => ({
      user_id: user.user_id,
      name: user.name,
      department: user.department,
      primary_ip: user.primary_ip,
      secondary_ip: user.secondary_ip,
      primary_device: user.primary_device,
      secondary_device: user.secondary_device,
      mu_login: user.mu_login,
      mu_files: user.mu_files,
      mu_download: user.mu_download
    }));

    await User.insertMany(usersToInsert);

    console.log(`${usersToInsert.length} users inserted successfully`);
    process.exit();

  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
