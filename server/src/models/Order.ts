import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  products: [
    {
      productType: { type: String, enum: ["flower", "bouquet"], required: true },
      productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
