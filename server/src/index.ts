import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";

import shopRoutes from "./routes/shops";
import flowerRoutes from "./routes/flowers";
import bouquetRoutes from "./routes/bouquets";
import orderRoutes from "./routes/orders";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const DB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "flowerShop";

app.use(cors());
app.use(express.json());

// API
app.use("/api/shops", shopRoutes);
app.use("/api/flowers", flowerRoutes);
app.use("/api/bouquets", bouquetRoutes);
app.use("/api/orders", orderRoutes);

// ===== SPA static + fallback =====
// Після компіляції __dirname -> server/dist, а client лежить у server/client
const spaCandidates = [
  path.resolve(__dirname, "../client/build"), // CRA
  path.resolve(__dirname, "../client/dist"),  // Vite
  path.resolve(__dirname, "./public"),        // резерв
];

const clientBuildPath =
  spaCandidates.find(p => fs.existsSync(path.join(p, "index.html"))) ?? spaCandidates[0];

console.log(
  "SPA path:",
  clientBuildPath,
  "exists=",
  fs.existsSync(path.join(clientBuildPath, "index.html"))
);

app.use(express.static(clientBuildPath, { index: false }));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Фолбек: віддаємо index.html для всіх GET, що не /api/* і не /health
app.use((req, res, next) => {
  const isApi = req.path.startsWith("/api/");
  const isHealth = req.path.startsWith("/health");
  const wantsHtml = !!req.accepts("html");
  if (req.method === "GET" && !isApi && !isHealth && wantsHtml) {
    return res.sendFile(path.join(clientBuildPath, "index.html"));
  }
  next();
});

// 404 (на випадок, якщо нічого не відпрацювало)
app.use((req, res) => {
  if (!res.headersSent) res.status(404).send("Not Found");
});

// ===== Start =====
(async () => {
  console.log("ENV check:", { hasURI: !!DB_URI, DB_NAME, PORT });

  try {
    if (DB_URI) {
      await mongoose.connect(DB_URI, { dbName: DB_NAME });
      console.log("Connected to MongoDB");
    } else {
      console.warn("MONGODB_URI is empty; starting server without DB connection.");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
})();
