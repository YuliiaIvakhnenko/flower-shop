import mongoose from "mongoose";

const bouquetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  flowers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flower" }],
  price: { type: Number, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  imageUrl: { type: String },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Bouquet", bouquetSchema);
