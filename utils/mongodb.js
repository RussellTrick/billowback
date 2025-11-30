import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

// Debug: Check if URI is loaded
console.log("MongoDB URI loaded:", uri ? "Yes ✓" : "No ✗");
console.log(
  "URI starts with:",
  uri ? uri.substring(0, 20) + "..." : "undefined"
);

if (!uri) {
  console.error("ERROR: MONGODB_URI is not defined in .env file!");
  console.log("Current working directory:", process.cwd());
  process.exit(1);
}

const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

let db = null;

export async function connectDB() {
  try {
    if (db) return db;

    await client.connect();
    console.log("Connected to MongoDB Atlas ✓");

    db = client.db("scoreboard");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function getDB() {
  if (!db) {
    await connectDB();
  }
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    console.log("MongoDB connection closed");
  }
}
