const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: Number,
  shippingWeight: Number,
  shippingWidth: Number,
  shippingLength: Number,
  shippingHeight: Number,
  imageUrl: { type: String, required: true },
  featured: { type: Boolean, required: true },
});

const productModel = mongoose.model("products", productSchema);

module.exports = productModel;
