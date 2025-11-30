import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

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
};

const defaultResults = [];

// Read JSON file
async function readJSON(filePath, defaultValue) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeJSON(filePath, defaultValue);
      return defaultValue;
    }
    throw error;
  }
}

// Write JSON file
async function writeJSON(filePath, data) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Scoreboard operations
export async function getScoreboard() {
  return await readJSON(SCOREBOARD_FILE, defaultScoreboard);
}

export async function updateScoreboard(gameType, player, score) {
  const scoreboard = await getScoreboard();

  if (!scoreboard[gameType]) {
    scoreboard[gameType] = { player1: 0, player2: 0 };
  }

  scoreboard[gameType][`player${player}`] = score;
  await writeJSON(SCOREBOARD_FILE, scoreboard);

  return scoreboard;
}

export async function resetScoreboard() {
  await writeJSON(SCOREBOARD_FILE, defaultScoreboard);
  await writeJSON(RESULTS_FILE, defaultResults);
  return defaultScoreboard;
}

// Results operations
export async function getResults() {
  return await readJSON(RESULTS_FILE, defaultResults);
}

export async function addResult(result) {
  const results = await getResults();
  const newResult = {
    ...result,
    id: Date.now(),
    timestamp: result.timestamp || new Date().toISOString(),
  };

  results.unshift(newResult);

  // Keep only last 100 results
  if (results.length > 100) {
    results.splice(100);
  }

  await writeJSON(RESULTS_FILE, results);
  return newResult;
}

export async function deleteResult(id) {
  const results = await getResults();
  const filtered = results.filter((r) => r.id !== parseInt(id));
  await writeJSON(RESULTS_FILE, filtered);
  return { success: true, deleted: id };
}
