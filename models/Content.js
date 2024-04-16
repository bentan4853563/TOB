const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema({
  regulator: {
    type: String,
  },
  description: {
    type: Array,
  },
});

module.exports = mongoose.model("content", ContentSchema);
