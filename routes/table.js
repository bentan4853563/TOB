const express = require("express");
const fs = require("fs");
const router = express.Router();
const Table = require("../models/Table");
const auth = require("../middleware/auth");

router.get("/readAll", async (req, res) => {
  try {
    const tableData = await Table.find();
    res.json(tableData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/getOne", auth, async (req, res) => {
  try {
    const uuid = req.body.uuid;
    const path = `TBData/reviewed/${uuid}.json`;

    // Use await here because readDataFromFile now returns a Promise
    const fileData = await readDataFromFile(path);
    const metaData = await Table.findOne({ uuid: uuid });
    res.send({ metaData, fileData });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error saving data" });
  }
});

router.post("/insert", auth, async (req, res) => {
  try {
    const { uuid, metaData, tableData } = req.body;

    const processPath = `TBData/processed/${uuid}.json`;
    const reviewedPath = `TBData/reviewed/${uuid}.json`;
    await saveDataToFile(tableData, processPath);
    await saveDataToFile(tableData, reviewedPath);

    let statusByCategory = Object.keys(tableData).map((category) => {
      return {
        category: category,
        comment: "",
        status: "Processed",
        version: 0,
      };
    });

    const inputData = {
      uuid,
      ...metaData,
      statusByCategory,
    };

    result = await Table.insertMany(inputData, {
      new: true,
      upsert: true,
    });
    console.log("result", result);

    res.json({ metaData: result, tableData });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error saving data" });
  }
});

router.post("/file-save", auth, async (req, res) => {
  try {
    const { uuid, tableData } = req.body;

    const filepath = `TBData/reviewed/${uuid}.json`;

    await saveDataToFile(tableData, filepath);

    res.json(tableData);
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error saving data" });
  }
});

router.post("/update", auth, async (req, res) => {
  try {
    const { uuid, tableData } = req.body;

    const previousFileData = await readDataFromFile(
      `TBData/processed/${uuid}.json`
    );

    const newTableData = {};
    Object.keys(tableData).forEach((category) => {
      if (
        tableData[category].status === "Revised" &&
        tableData[category].version > previousFileData[category].version
      ) {
        console.log("true");
        newTableData[category] = {
          ...previousFileData[category],
          version: tableData[category].version,
        };
      } else {
        newTableData[category] = tableData[category];
      }
    });

    const filepath = `TBData/reviewed/${uuid}.json`;

    await saveDataToFile(newTableData, filepath);

    let statusByCategory = Object.keys(newTableData).map((category) => {
      return {
        category: category,
        status: tableData[category].status,
        version: tableData[category].version,
        comment: tableData[category].comment,
        resultTOB: tableData[category].resultTOB,
      };
    });

    const result = await Table.findOneAndUpdate(
      { uuid: uuid },
      { statusByCategory },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({ metaData: result, tableData, newTableData });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error saving data" });
  }
});

router.post("/review", auth, async (req, res) => {
  try {
    const { uuid } = req.body;
    if (!uuid) {
      return res.status(400).json({ message: "UUID must be provided" });
    }
    const result = await Table.findOneAndUpdate(
      { uuid: uuid },
      { status: "Reviewed" },
      { new: true }
    ); // Use 'new: true' to return the updated document
    if (result) {
      res.status(200).json(result);
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
      query.previousInsurer = insurer;
    }
    console.log(query);
    let documents = [];
    if (Object.keys(query).length > 0) {
      documents = await Table.find(query);
    }
    console.log(documents);
    res.json({ message: "Success", data: documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const createFileNameWithPrefix = (clientName) => {
  // Prefix
  const prefix = "QIC";

  // Function to sanitize input to ensure it's safe for file names
  function sanitizeInput(input) {
    // Replace any character not allowed in file names with an underscore
    return input.replace(/[\/\\:*?"<>|\s]+/g, "_");
  }

  // Sanitize the client name
  const safeClientName = sanitizeInput(clientName);

  // Get today's date and format it as yyyy_dd_mm
  const today = new Date();
  const year = today.getFullYear();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  const dateStr = `${year}_${day}_${month}`;

  // Construct the file name with prefix, sanitized client name, and formatted date
  const fileName = `${prefix}_${safeClientName}_${dateStr}`;

  return fileName;
};

router.post("/fileUploadAndSave", async (req, res) => {
  try {
    const { table, metaData } = req.body;

    let newResultTOB;
    if (metaData.resultTOB) {
      newResultTOB = metaData.resultTOB;
    } else {
      if (metaData.sourceTOB) {
        newResultTOB = createFileNameWithPrefix(metaData.client);
      } else {
        newResultTOB = Math.random().toString(36).substring(2, 15);
      }
    }

    const filepath = `/TBData/${newResultTOB}.json`;
    await saveDataToFile(table, filepath);

    const update = {
      broker: metaData.broker,
      client: metaData.client,
      previousInsurer: metaData.previousInsurer,
      sourceTOB: metaData.sourceTOB,
      status: metaData.status,
      tobType: metaData.tobType, // Fixing the potential typo here from topType to tobType
      resultTOB: newResultTOB,
    };

    await Table.findOneAndUpdate({ resultTOB: newResultTOB }, update, {
      new: true,
      upsert: true,
    });

    res.send({
      success: true,
      message: "Data saved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error saving data" });
  }
});

const saveDataToFile = async (data, filePath) => {
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

// DELETE endpoint to handle record deletion
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    const result = await Table.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Record not found" });
    }
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting record", error: error.message });
  }
});

module.exports = router;

module.exports = router;
