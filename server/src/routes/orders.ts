import express from "express";
import Order from "../models/Order";
import Flower from "../models/Flower";
import Bouquet from "../models/Bouquet";
import mongoose from "mongoose";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, phone, address, products } = req.body;

    let totalPrice = 0;

    for (const p of products) {
      if (p.productType === "flower") {
        const flower = await Flower.findById(p.productId);
        if (flower) totalPrice += flower.price * p.quantity;
      } else if (p.productType === "bouquet") {
        const bouquet = await Bouquet.findById(p.productId);
        if (bouquet) totalPrice += bouquet.price * p.quantity;
      }
    }

    const order = new Order({
      email,
      phone,
      address,
      products,
      totalPrice,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: "Error creating order" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const [order] = await Order.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "flowers",
          let: { pid: "$products.productId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$pid"] } } }
          ],
          as: "flowerDoc"
        }
      },

      {
        $lookup: {
          from: "bouquets",
          let: { pid: "$products.productId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$pid"] } } }
          ],
          as: "bouquetDoc"
        }
      },

      {
        $addFields: {
          picked: {
            $cond: [
              { $eq: ["$products.productType", "flower"] },
              { $arrayElemAt: ["$flowerDoc", 0] },
              { $arrayElemAt: ["$bouquetDoc", 0] }
            ]
          }
        }
      },

      {
        $addFields: {
          expanded: {
            productType: "$products.productType",
            productId: "$products.productId",
            quantity: "$products.quantity",
            name: "$picked.name",
            imageUrl: "$picked.imageUrl",
            price: "$picked.price"
          }
        }
      },

      {
        $group: {
          _id: "$_id",
          email: { $first: "$email" },
          phone: { $first: "$phone" },
          address: { $first: "$address" },
          totalPrice: { $first: "$totalPrice" },
          createdAt: { $first: "$createdAt" },
          products: { $push: "$expanded" }
        }
      },

      {
        $addFields: {
          products: {
            $filter: {
              input: "$products",
              as: "p",
              cond: { $ne: ["$$p", null] }
            }
          }
        }
      }
    ]);

    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching order" });
  }
});

export default router;
