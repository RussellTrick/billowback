import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import scoreboardRoutes from "./routes/scoreboard.js";
import resultsRoutes from "./routes/results.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://billow-scoreboard.netlify.app", // Your Netlify URL
      "https://*.netlify.app", // Or allow all Netlify domains
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
