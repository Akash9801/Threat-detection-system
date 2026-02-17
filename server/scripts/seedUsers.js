require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Optional: Clear existing users
    await User.deleteMany({});
    console.log("Old users cleared");

    const users = [];

    for (let i = 1; i <= 20; i++) {
      users.push({
        user_id: "U" + (100 + i),
        name: "Employee " + i
      });
    }

    await User.insertMany(users);

    console.log("20 users inserted successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
