import express from "express";
import Shop from "../models/Shop";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch {
    res.status(500).json({ error: "Error fetching shops" });
  }
});


router.post("/", async (req, res) => {
  try {
    const shop = new Shop(req.body);
    await shop.save();
    res.status(201).json(shop);
  } catch {
    res.status(400).json({ error: "Error creating shop" });
  }
});

export default router;
