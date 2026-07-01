require("dotenv").config();
console.log(process.env.GEMINI_API_KEY);
const aiRoute =require("./routes/aiRoute");
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const executeRoute = require("./routes/execute");
const projectRoutes = require("./routes/projectRoutes");
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log("MongoDB Connected")
  )
  .catch(console.error);

app.use("/api", executeRoute);
app.use("/api", projectRoutes);

// Debug Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

require("./socket/socketHandler")(io);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running...");
});
app.use("/api/ai", aiRoute);
// Error Handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    error: err.message,
  });
});

const PORT =
  process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(
    `🚀 Server Running On Port ${PORT}`
  );
});
console.log(
  "API KEY:",
  process.env.GEMINI_API_KEY?.slice(0,10)
);