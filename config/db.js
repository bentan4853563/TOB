const mongoose = require("mongoose");
const db = "mongodb://127.0.0.1:27017/";

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("Mongodb connected...");
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
