import express from "express";
import { Pool } from "pg";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3010",
    methods: ["GET", "POST"],
  },
});

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Post endpoint to receive text data
app.post("/api/text", async (req, res) => {
  try {
    const { content } = req.body;

    // Insert into database
    const result = await pool.query(
      "INSERT INTO text_data (content) VALUES ($1) RETURNING *",
      [content]
    );

    const savedData = result.rows[0];

    // Emit to all connected clients
    io.emit("newText", savedData);

    res.status(201).json(savedData);
  } catch (error) {
    console.error("Error saving text:", error);
    res.status(500).json({ error: "Failed to save text data" });
  }
});

// Get all texts endpoint
app.get("/api/texts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM text_data ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching texts:", error);
    res.status(500).json({ error: "Failed to fetch text data" });
  }
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
