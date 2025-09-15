import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
});

export default mongoose.model("Shop", shopSchema);
