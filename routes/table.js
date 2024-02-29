const express = require("express");
const fs = require("fs");
const router = express.Router();
const Table = require("../models/Table");
const auth = require("../middleware/auth");

router.get("/readAll", async (req, res) => {
	try {
		const tableData = await Table.find().select({
			broker: 1,
			client: 1,
			previousInsurer: 1,
			policyPeriod: 1,
			sourceTOB: 1,
			resultTOB: 1,
			status: 1,
		});
		console.log(tableData);
		res.json(tableData);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post("/getOne", auth, async (req, res) => {
	try {
		const { resultTOB, _id } = req.body;
		console.log("resultTOB", resultTOB, _id, req.body);
		// Use await here because readDataFromFile now returns a Promise
		const fileData = await readDataFromFile(resultTOB);
		console.log(fileData);
		const metaData = await Table.findOne({ _id: _id });
		console.log(metaData);

		res.send({ metaData, fileData });
	} catch (error) {
		console.error(error);
		res.status(500).send({ success: false, message: "Error saving data" });
	}
});

router.post("/review", auth, async (req, res) => {
	try {
		const { id } = req.body;
		if (!id) {
			return res.status(400).json({ message: "ID must be provided" });
		}
		const result = await Table.findByIdAndUpdate(
			id,
			{ status: "Review" },
			{ new: true }
		); // Use 'new: true' to return the updated document
		if (result) {
			res
				.status(200)
				.json({ message: "Status updated to Review", data: result });
		} else {
			res.status(404).json({ message: "Document not found with provided ID" });
		}
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Server error occurred", error: error.message });
	}
});

router.post("/search", async (req, res) => {
	try {
		const { broker, client, insurer } = req.body;
		const query = {};

		if (broker && broker.trim() !== "") {
			query.broker = broker;
		}
		if (client && client.trim() !== "") {
			query.client = client;
		}
		if (insurer && insurer.trim() !== "") {
			query.insurer = insurer;
		}
		console.log(query);
		let documents = [];
		if (Object.keys(query).length > 0) {
			documents = await Table.find(query);
		}
		res.json({ message: "Success", data: documents });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

router.post("/fileUploadAndSave", async (req, res) => {
	try {
		const { table, metaData } = req.body;
		console.log("metaData", metaData);

		let newResultTOB;
		if (metaData.resultTOB) {
			newResultTOB = metaData.resultTOB;
		} else {
			if (metaData.sourceTOB) {
				newResultTOB = `/TBData/${metaData.sourceTOB}.json`;
			} else {
				const randomString = Math.random().toString(36).substring(2, 15);
				newResultTOB = `/TBData/${randomString}.json`;
			}
		}

		saveDataToFile(table, newResultTOB);

		const newTableData = {
			broker: metaData.broker,
			client: metaData.client,
			previousInsurer: metaData.previousInsurer,
			sourceTOB: metaData.sourceTOB,
			resultTOB: newResultTOB,
		};
		// policyPeriod: metaData.policyPeriod,

		if (metaData._id) {
			await Table.findByIdAndUpdate(metaData._id, newTableData, {
				upsert: true,
			});
		} else {
			const table = new Table(newTableData);
			await table.save();
		}

		res.send({
			success: true,
			message: "Data saved successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ success: false, message: "Error saving data" });
	}
});

const saveDataToFile = (data, filePath) => {
	const jsonData = JSON.stringify(data, null, 2); // Pretty print the JSON

	fs.writeFile(filePath, jsonData, (err) => {
		if (err) {
			console.error("Error writing to file:", err);
		} else {
			console.log("Data saved successfully to", filePath);
		}
	});
};

const readDataFromFile = (filePath) => {
	// Return a new Promise
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err, data) => {
			if (err) {
				console.error("Error reading from file:", err);
				reject(err); // Reject the Promise if there is an error
			} else {
				try {
					const parsedData = JSON.parse(data);
					resolve(parsedData); // Resolve the Promise with the parsed data
				} catch (parseError) {
					console.error("Error parsing JSON from file:", parseError);
					reject(parseError); // Reject the Promise if JSON parsing fails
				}
			}
		});
	});
};
router.put("/update", auth, async (req, res) => {
	const { _id, firstName, lastName, email, state } = req.body;

	try {
		const updatedTableEntry = await Table.findByIdAndUpdate({ _id }, req.body, {
			new: true,
		});
		if (!updatedTableEntry) {
			return res.status(404).json({ message: "Table entry not found" });
		}
		res.status(200).json(updatedTableEntry);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

router.delete("/delete/:id", auth, async (req, res) => {
	const { id } = req.params;
	try {
		const deletedTableEntry = await Table.findByIdAndDelete(id);

		if (!deletedTableEntry) {
			return res
				.status(404)
				.json({ success: false, message: "Table entry not found" });
		}

		console.log("Deleted successfully");
		res.status(200).json({ success: true, message: "Deleted successfully" });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ success: false, message: "Error deleting table entry" });
	}
});

module.exports = router;
