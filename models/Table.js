const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  broker: {
    type: String,
  },
  client: {
    type: String,
  },
  previousInsurer: {
    type: String,
  },
  policyPeriod: {
    type: String,
  },
  sourceTOB: {
    type: String,
  },
  resultTOB: {
    type: String,
  },
});

module.exports = mongoose.model("table", TableSchema);
