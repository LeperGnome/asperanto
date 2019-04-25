const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create service schema
const ServiceSchema = new Schema({
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

ServiceSchema.pre("find", autoPopulate).pre("findOne", autoPopulate);

ServiceSchema.index({ name: "text", description: "text" });

module.exports = Service = mongoose.model("services", ServiceSchema);
