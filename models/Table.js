const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true,
  },
  tobType: {
    type: String,
  },
  insurer: {
    type: String,
  },
  client: {
    type: String,
  },
  broker: {
    type: String,
  },
  sourceTOB: {
    type: String,
  },
  statusByCategory: {
    type: Array,
  },
});

module.exports = mongoose.model("table", TableSchema);
