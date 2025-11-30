import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import scoreboardRoutes from "./routes/scoreboard.js";
import resultsRoutes from "./routes/results.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Updated CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://billow-scoreboard.netlify.app",
        "https://twobillows.netlify.app",
      ];

      // Check if origin ends with .netlify.app
      if (allowedOrigins.includes(origin) || origin.endsWith(".netlify.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
