import mongoose from "mongoose";

const flowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  imageUrl: { type: String },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Flower", flowerSchema);
