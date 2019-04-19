const Validator = require("validator");
const isEmpty = require("./is-empty");
const mongoose = require("mongoose");

// Import subproject model
const Subproject = require("../models/Subproject");

module.exports = function validateRequestInput(data) {
  var errors = {};

  data.unitCount = !isEmpty(data.unitCount) ? data.unitCount : "";
  data.subprojectId = !isEmpty(data.subprojectId) ? data.subprojectId : "";

  if (!Validator.isNumeric(data.unitCount)) {
    errors.unitCount = "Count should be a number";
  }

  try {
    var validSubprojectId = mongoose.Types.ObjectId(data.subprojectId);
  } catch (err) {
    errors.subprojectId = "Subproject id is not valid";
  }

  if (Validator.isEmpty(data.unitCount)) {
    errors.unitCount = "Count field is required";
  }

  if (Validator.isEmpty(data.subprojectId)) {
    errors.subprojectId = "Subproject field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
