import express from "express";
import Flower from "../models/Flower";
import mongoose from "mongoose";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const { sort, favorites, shopId } = req.query;
    let query: any = {};

    if (favorites === "true") {
      query.isFavorite = true;
    }

    if (shopId) {
        if (!mongoose.isValidObjectId(shopId as string)) {
            return res.status(400).json({ error: "Невалідний shopId" });
        }
        query.shopId = shopId; // Mongoose сам кастне
    }


    let sortOption: any = {};
    if (sort === "price") {
      sortOption.price = 1;
    } else if (sort === "date") {
      sortOption.createdAt = -1;
    }

    const flowers = await Flower.find(query)
      .populate("shopId") 
      .sort(sortOption);

    res.json(flowers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching flowers" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, price, shopId, imageUrl, isFavorite } = req.body;

    const flower = new Flower({
      name,
      price,
      shopId,
      imageUrl,   
      isFavorite: isFavorite || false
    });

    await flower.save();
    res.status(201).json(flower);
  } catch {
    res.status(400).json({ error: "Error adding flower" });
  }
});

export default router;
