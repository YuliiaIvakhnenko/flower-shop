import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import shopRoutes from "./routes/shops";
import flowerRoutes from "./routes/flowers";
import bouquetRoutes from "./routes/bouquets";
import orderRoutes from "./routes/orders";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const DB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "flowerShop";

app.use(cors());
app.use(express.json());

app.use("/api/shops", shopRoutes);
app.use("/api/flowers", flowerRoutes);
app.use("/api/bouquets", bouquetRoutes);
app.use("/api/orders", orderRoutes);

mongoose
  .connect(DB_URI, { dbName: DB_NAME })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
