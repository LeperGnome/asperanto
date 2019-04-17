const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create company schema
const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  urlName: {
    type: String,
    required: true
    //, default : ???
  },
  // Отрасли в которых задействована компания
  industries: {
    type: [String],
    required: true
  },
  asperantoType: {
    type: [String]
  },
  // ПАО, ООО, МИБ ...
  businessType: {
    type: String,
    required: true
  },
  countryOfIncorporation: {
    type: String,
    required: true
  },
  registeredFrom: {
    type: Date,
    default: Date.now()
  },
  productsList: [
    {
      type: Schema.Types.ObjectId,
      ref: "products"
    }
  ],
  servicesList: [
    {
      type: Schema.Types.ObjectId,
      ref: "services"
    }
  ],
  projects: [
    {
      type: Schema.Types.ObjectId,
      ref: "projects"
    }
  ],
  members: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      // Should be a ref
      permissions: {
        type: String,
        required: true
      }
    }
  ],
  tags: {
    type: [String]
  }
});

module.exports = Organization = mongoose.model(
  "organizations",
  OrganizationSchema
);
