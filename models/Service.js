const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create service schema
const ServiceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  addDate: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Service = mongoose.model("services", ServiceSchema);
