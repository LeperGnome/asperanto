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
  subprojectId: {
    type: Schema.Types.ObjectId,
    ref: "subprojects"
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

const autoPopulate = function(next) {
  this.populate("organization", ["name", "urlName", "avatar"]);
  next();
};

ProductSchema.pre("find", autoPopulate).pre("findOne", autoPopulate);

ProductSchema.index({ name: "text", description: "text" });

module.exports = Product = mongoose.model("products", ProductSchema);
