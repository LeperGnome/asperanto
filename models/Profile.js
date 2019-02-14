const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create schema
const ProfileSchema = new Schema({
  // User reference
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  // List of companies related to user
  companies: [
    {
      comId: {
        type: Schema.Types.ObjectId,
        ref: "companies"
      },
      position: {
        type: String,
        required: true
      },
      corporateEmail: {
        type: String
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      }
    }
  ],
  // List of user contacts
  contacts: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  // List of user's favorite companies, products and servises
  favorites: {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "products"
        }
      }
    ],
    companies: [
      {
        company: {
          type: Schema.Types.ObjectId,
          ref: "companies"
        }
      }
    ],
    services: [
      {
        service: {
          type: Schema.ObjectId,
          ref: "services"
        }
      }
    ]
  }
});

module.exports = Profile = mongoose.model("profiles", ProfileSchema);
