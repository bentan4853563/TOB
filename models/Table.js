const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
	previousInsurer: {
		type: String,
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
	sourceTOB: {
		type: String,
	},
	resultTOB: {
		type: String,
	},
	status: {
		type: String,
		default: "Progress",
	},
});

module.exports = mongoose.model("table", TableSchema);
