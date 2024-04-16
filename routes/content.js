const express = require("express");
const router = express.Router();

const Content = require("../models/Content");

router.get("/find", async (req, res) => {
  try {
    const contents = await Content.find();
    res.json(contents);
  } catch (error) {
    console.error("Error creating content:", error);
  }
});

router.post("/insert", async (req, res) => {
  console.log(req.body, Object.keys(req.body));
  try {
    result = await Content.insertMany(req.body, {
      new: true,
      upsert: true,
    });
  } catch (error) {
    console.error("Error creating content:", error);
  }
});

router.post("/update", async (req, res) => {
  try {
    const { id, contentData } = req.body;

    const result = await Content.findByIdAndUpdate(
      id,
      { contentData },
      {
        new: true,
        upsert: true,
      }
    );
    console.log("result", result);

    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error saving data" });
  }
});

module.exports = router;
