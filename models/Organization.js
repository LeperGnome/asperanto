const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create company schema
const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  urlName: {
    type: String
    //, default : ???
  },
  // Отрасли в которых задействована компания
  industries: {
    type: [String],
    required: true
  },
  // aperanto-type : [  ]
  type: {
    type: [String],
    required: true
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
  ]
});

module.exports = Organization = mongoose.model(
  "organizations",
  OrganizationSchema
);
