import express from "express";
import { getResults, addResult, deleteResult } from "../utils/storage.js";

const router = express.Router();

// GET /api/results - Get all results
router.get("/", async (req, res) => {
  try {
    const results = await getResults();
    res.json(results);
  } catch (error) {
    console.error("Error getting results:", error);
    res.status(500).json({ error: "Failed to get results" });
  }
});

// GET /api/results/latest - Get most recent result
router.get("/latest", async (req, res) => {
  try {
    const results = await getResults();
    if (results.length === 0) {
      return res.json(null);
    }
    res.json(results[0]);
  } catch (error) {
    console.error("Error getting latest result:", error);
    res.status(500).json({ error: "Failed to get latest result" });
  }
});

// POST /api/results - Add a new result
router.post("/", async (req, res) => {
  try {
    const { gameType, winner, action } = req.body;

    if (!gameType) {
      return res.status(400).json({ error: "Game type is required" });
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

    const result = await addResult(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error adding result:", error);
    res.status(500).json({ error: "Failed to add result" });
  }
});

// DELETE /api/results/:id - Delete a result
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteResult(id);
    res.json(result);
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({ error: "Failed to delete result" });
  }
});

export default router;
