const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create product schema
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  // Product id inside company
  innerId: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
    //, default : ???
  },
  description: {
    type: String,
    required: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organizations"
  },
  potencial: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String]
  },
  addDate: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Product = mongoose.model("products", ProductSchema);
