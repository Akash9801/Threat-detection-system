require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const logRoutes = require("./routes/logRoutes");

const app = express();

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


app.use(cors({
  origin: "*"
}));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

app.use("/api/logs", logRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
console.log("Server started successfully");
