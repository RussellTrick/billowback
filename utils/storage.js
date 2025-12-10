import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getDB } from "./mongodb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const SCOREBOARD_FILE = path.join(DATA_DIR, "scoreboard.json");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Default data structures
const defaultScoreboard = {
  darts: { player1: 0, player2: 0 },
  "american-pool": { player1: 0, player2: 0 },
  "british-pool": { player1: 0, player2: 0 },
  wordle: { player1: 0, player2: 0 },
  contexto: { player1: 0, player2: 0 },
  "boom-battle-bar": { player1: 0, player2: 0 },
  bowling: { player1: 0, player2: 0 },
};

// Player names configuration
const playerNames = {
  player1: "Owain",
  player2: "Billie",
};

export async function getPlayerNames() {
  return playerNames;
}

// Scoreboard operations
export async function getScoreboard() {
  try {
    const db = await getDB();
    const collection = db.collection("scores");

    let scoreboard = await collection.findOne({ _id: "current" });

    if (!scoreboard) {
      // Initialize with default data
      scoreboard = { _id: "current", ...defaultScoreboard };
      await collection.insertOne(scoreboard);
    }

    // Remove MongoDB _id from response
    const { _id, ...scores } = scoreboard;
    return scores;
  } catch (error) {
    console.error("Error getting scoreboard:", error);
    return defaultScoreboard;
  }
}

export async function updateScoreboard(gameType, player, score) {
  try {
    const db = await getDB();
    const collection = db.collection("scores");

    const updateField = `${gameType}.player${player}`;

    await collection.updateOne(
      { _id: "current" },
      {
        $set: { [updateField]: score },
      },
      { upsert: true }
    );

    return await getScoreboard();
  } catch (error) {
    console.error("Error updating scoreboard:", error);
    throw error;
  }
}

export async function resetScoreboard() {
  try {
    const db = await getDB();
    const scoresCollection = db.collection("scores");
    const resultsCollection = db.collection("results");

    // Reset scores
    await scoresCollection.replaceOne(
      { _id: "current" },
      { _id: "current", ...defaultScoreboard },
      { upsert: true }
    );

    // Clear results
    await resultsCollection.deleteMany({});

    return defaultScoreboard;
  } catch (error) {
    console.error("Error resetting scoreboard:", error);
    throw error;
  }
}

// Results operations
export async function getResults() {
  try {
    const db = await getDB();
    const collection = db.collection("results");

    const results = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return results;
  } catch (error) {
    console.error("Error getting results:", error);
    return [];
  }
}

export async function addResult(result) {
  try {
    const db = await getDB();
    const collection = db.collection("results");

    const newResult = {
      ...result,
      timestamp: result.timestamp || new Date().toISOString(),
    };

    const insertResult = await collection.insertOne(newResult);

    return {
      ...newResult,
      _id: insertResult.insertedId,
    };
  } catch (error) {
    console.error("Error adding result:", error);
    throw error;
  }
}

export async function deleteResult(id) {
  try {
    const db = await getDB();
    const collection = db.collection("results");
    const { ObjectId } = await import("mongodb");

    await collection.deleteOne({ _id: new ObjectId(id) });

    return { success: true, deleted: id };
  } catch (error) {
    console.error("Error deleting result:", error);
    throw error;
  }
}
