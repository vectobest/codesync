require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const executeRoute = require("./routes/execute");
const projectRoutes = require("./routes/projectRoutes");
const aiRoute = require("./routes/aiRoute");

const app = express();

// ================= Middleware =================

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Not Allowed"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ================= MongoDB =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
  });

// ================= Debug =================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ================= Routes =================

app.use("/api", executeRoute);
app.use("/api", projectRoutes);
app.use("/api/ai", aiRoute);

// ================= Root =================

app.get("/", (req, res) => {
  res.send("Backend Running v2");
});

// ================= Server =================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

require("./socket/socketHandler")(io);

// ================= Error Handler =================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    error: err.message,
  });
});

// ================= Start =================

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server Running On Port ${PORT}`);
  console.log(
    "API KEY:",
    process.env.GEMINI_API_KEY?.slice(0, 10)
  );
});