import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import messagesRoutes from "./routes/MessagesRoute.js";
import channelRoutes from "./routes/ChannelRoutes.js";
import setupSocket from "./socket.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const databaseURL = process.env.DATABASE_URL;

// ✅ Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware setup
app.use(
  cors({
    origin: [process.env.ORIGIN || "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// ✅ Static folders for uploaded files
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

// ✅ Serve frontend (React build) from client/dist
const clientPath = path.join(__dirname, "client", "dist");
app.use(express.static(clientPath));

// ✅ Fallback: serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// ✅ Start the server
const server = app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});

// ✅ Setup socket.io
setupSocket(server);

// ✅ Connect to MongoDB
mongoose
  .connect(databaseURL)
  .then(() => console.log("✅ DB Connection Successful"))
  .catch((err) => console.error("❌ DB Connection Error:", err.message));
