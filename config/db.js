const mongoose = require("mongoose");
const db = "mongodb://Admin:45gEJdPMO1fE@13.200.164.92:27017/";

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
