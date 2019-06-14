const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  tradeRequest: {
    type: Schema.Types.ObjectId,
    ref: "tradeRequests"
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organizations"
  },
  text: {
    type: String,
    required: true
  },
  sentDate: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Message = mongoose.model("messages", MessageSchema);
