const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubprojectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  tradeRequests: [
    {
      requestId: {
        type: Schema.Types.ObjectId,
        ref: "tradeRequests"
      }
    }
  ],
  creationDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = Subproject = mongoose.model("subprojects", SubprojectSchema);
