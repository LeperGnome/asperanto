const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// List of status possible values
// просто для справки
statusList = [
  "В рассмотрении",
  "В процессе производства",
  "Ожидает на складе",
  "В пути",
  "Доставлено"
];

// Create trade request schema
const TradeRequestSchema = new Schema({
  // seller
  provider: {
    type: Schema.Types.ObjectId,
    ref: "organizations"
  },
  // buyer
  receiver: {
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
  subproject: {
    type: Schema.Types.ObjectId,
    ref: "subprojects"
  },
  dateOfManufacture: {
    type: String,
    required: true
  },
  dateOpen: {
    type: Date,
    default: Date.now()
  },
  dateClosed: {
    type: Date
  },
  status: {
    type: String,
    default: "CREATED"
  }
});

module.exports = TradeRequest = mongoose.model(
  "tradeRequests",
  TradeRequestSchema
);
