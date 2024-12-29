import mongoose from "mongoose";

// User Schema
const UserSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], 
    },
    { timestamps: true }
  );

// Product Schema
const ProductSchema = new mongoose.Schema(
    {
      productName: { type: String, required: true },  
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
    { timestamps: true }
  );


export const User = mongoose.model("User", UserSchema);
export const Product = mongoose.model("Product", ProductSchema);
