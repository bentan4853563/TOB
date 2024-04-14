const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true,
  },
  client: {
    type: String,
  },
  broker: {
    type: String,
  },
  tobType: {
    type: String,
  },
  insurer: {
    type: String,
  },
  gulfPlan: {
    type: String,
  },
  AIPlan: {
    type: String,
  },
  ThiqaPlan: {
    type: String,
  },
  regulator: {
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
