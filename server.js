const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

connectDB();

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/table", require("./routes/table"));
app.use("/api/content", require("./routes/content"));

// app.use("/TBData", require("./routes/fileUpload"));
app.use(express.static("TBData"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/dist"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5009;

app.listen(PORT, async () => {
  console.log(`Server started on ${PORT}`);
});
