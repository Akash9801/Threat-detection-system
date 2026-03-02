const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Log = require("../models/Log");


router.get("/", async (req, res) => {
  try {
    const search = req.query.search;

    if (!search) {
      const users = await User.find().sort({ user_id: 1 });
      return res.json(users);
    }

    const users = await User.find({
      $or: [
        { user_id: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } }
      ]
    });

    if (!users.length) {
      return res.status(404).json({ message: "No such user present" });
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


router.get("/:id/logins", async (req, res) => {
  try {
    const logs = await Log.find({ user_id: req.params.id })
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user logs" });
  }
});

module.exports = router;
