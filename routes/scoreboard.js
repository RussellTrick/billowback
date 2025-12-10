import express from "express";
import {
  getScoreboard,
  updateScoreboard,
  resetScoreboard,
  getPlayerNames,
} from "../utils/storage.js";

const router = express.Router();

// GET /api/scoreboard - Get current scoreboard
router.get("/", async (req, res) => {
  try {
    const scoreboard = await getScoreboard();
    res.json(scoreboard);
  } catch (error) {
    console.error("Error getting scoreboard:", error);
    res.status(500).json({ error: "Failed to get scoreboard" });
  }
});

// POST /api/scoreboard/update - Update a score
router.post("/update", async (req, res) => {
  try {
    const { gameType, player, score } = req.body;

    if (!gameType || !player || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (
      ![
        "darts",
        "american-pool",
        "british-pool",
        "wordle",
        "contexto",
        "boom-battle-bar",
        "bowling",
      ].includes(gameType)
    ) {
      return res.status(400).json({ error: "Invalid game type" });
    }

    if (![1, 2].includes(player)) {
      return res.status(400).json({ error: "Invalid player number" });
    }

    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ error: "Invalid score" });
    }

    const scoreboard = await updateScoreboard(gameType, player, score);
    res.json({ success: true, scoreboard });
  } catch (error) {
    console.error("Error updating scoreboard:", error);
    res.status(500).json({ error: "Failed to update scoreboard" });
  }
});

// POST /api/scoreboard/reset - Reset all scores
router.post("/reset", async (req, res) => {
  try {
    const scoreboard = await resetScoreboard();
    res.json({ success: true, scoreboard });
  } catch (error) {
    console.error("Error resetting scoreboard:", error);
    res.status(500).json({ error: "Failed to reset scoreboard" });
  }
});

// GET /api/scoreboard/players - Get player names
router.get("/players", async (req, res) => {
  try {
    const players = await getPlayerNames();
    res.json(players);
  } catch (error) {
    console.error("Error getting player names:", error);
    res.status(500).json({ error: "Failed to get player names" });
  }
});

export default router;
