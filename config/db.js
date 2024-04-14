const mongoose = require("mongoose");
const db =
  "mongodb+srv://yakiv390497:N4gkZwUKD2GahJVA@cluster0.mem6wir.mongodb.net/TOB";

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log(`Mongodb connected...${db}`);
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
