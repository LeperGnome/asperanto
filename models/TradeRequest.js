const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create trade request schema
const TradeRequestSchema = new Schema({
  // seller
  manufacturer: {
    type: Schema.Types.ObjectId,
    ref: "organizations"
  },
  // buyer
  developer: {
    type: Schema.Types.ObjectId,
    ref: "organizations"
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "products"
  },
  unitCount: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  dateOfManufacture: {
    type: Date,
    required: true
  },
  dateOpen: {
    type: Date,
    default: Date.now()
  },
  dateClosed: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = TradeRequest = mongoose.model(
  "tradeRequests",
  TradeRequestSchema
);
