const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/table", require("./routes/table"));

app.use("/TBData", express.static("./TBData"));

if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/dist"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5009;

app.listen(PORT, async () => {
  console.log(`Server started on ${PORT}`);
});
