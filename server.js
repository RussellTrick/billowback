import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import scoreboardRoutes from "./routes/scoreboard.js";
import resultsRoutes from "./routes/results.js";
import { connectDB } from "./utils/mongodb.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Updated CORS configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Routes
app.use("/api/scoreboard", scoreboardRoutes);
app.use("/api/results", resultsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Initialize MongoDB and start server
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log("MongoDB connected successfully");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
