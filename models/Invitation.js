const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create schema
const InvitationSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  permissions: {
    type: String,
    required: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organizations"
  },
  active: {
    type: Boolean,
    default: true
  }
  // SHOULD ADD HASH
  // right now _id stands for it
});

module.exports = Invitation = mongoose.model("invitations", InvitationSchema);
