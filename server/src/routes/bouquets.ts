import express from "express";
import mongoose from "mongoose";
import Bouquet from "../models/Bouquet";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { sort, favorites, shopId, flowerId, match } = req.query as {
      sort?: "price" | "date";
      favorites?: "true" | "false";
      shopId?: string;
      flowerId?: string;
      match?: "all" | "any";
    };

    const query: Record<string, any> = {};

    if (shopId) {
      if (!mongoose.isValidObjectId(shopId)) {
        return res.status(400).json({ error: "Невалідний shopId" });
      }
      query.shopId = shopId;
    }

    if (favorites === "true") {
      query.isFavorite = true;
    }

    if (flowerId) {
      const flowerIds = flowerId.split(",").filter(mongoose.isValidObjectId);
      if (flowerIds.length === 0) {
        return res.status(400).json({ error: "Невалідні flowerId" });
      }

      if (match === "all") {
        query.flowers = { $all: flowerIds };
      } else {
        query.flowers = { $in: flowerIds };
      }
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (sort === "price") sortOption.price = 1;
    else if (sort === "date") sortOption.createdAt = -1;

    console.log("Mongo query:", query);

    const bouquets = await Bouquet.find(query)
      .populate("flowers")
      .populate("shopId")
      .sort(sortOption);

    res.json(bouquets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching bouquets" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, flowers, price, shopId, imageUrl, isFavorite } = req.body;

    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ error: "Невалідний shopId" });
    }
    if (!Array.isArray(flowers) || !flowers.every(mongoose.isValidObjectId)) {
      return res.status(400).json({ error: "flowers має бути масивом ObjectId" });
    }

    const bouquet = new Bouquet({
      name,
      flowers,
      price,
      shopId,
      imageUrl,
      isFavorite: !!isFavorite
    });

    await bouquet.save();
    res.status(201).json(bouquet);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Error adding bouquet" });
  }
});

export default router;
