const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const api = require("./src/routes/api");
const { initWebSocket } = require("./socket");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running",
  });
});

app.use("/api", api);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initWebSocket(server);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket running on ws://localhost:${PORT}/ws`);
  });
}

module.exports = app;