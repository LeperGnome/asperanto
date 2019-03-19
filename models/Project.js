const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  subprojects: [
    {
      subprojectId: {
        type: Schema.Types.ObjectId,
        ref: "subprojects"
      }
    }
  ],
  creationDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = Project = mongoose.model("projects", ProjectSchema);
