const Validator = require("validator");
const isEmpty = require("./is-empty");
const mongoose = require("mongoose");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.price = !isEmpty(data.price) ? data.price : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.subprojectId = !isEmpty(data.subprojectId) ? data.subprojectId : "";

  if (!Validator.isLength(data.name, { min: 2, max: 256 })) {
    errors.name = "Name must be between 2 and 256 characters";
  }
  if (!Validator.isLength(data.description, { min: 10 })) {
    errors.description = "Description must be at least 10 characters";
  }
  if (!Validator.isNumeric(data.price)) {
    errors.price = "Price should be a number";
  }
  if (data.price <= 0) {
    errors.price = "Price should be a positive number";
  }
  try {
    var validSubprojectId = mongoose.Types.ObjectId(data.subprojectId);
  } catch (err) {
    errors.subprojectId = "Subproject id is not valid";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is reqired";
  }
  if (Validator.isEmpty(data.price)) {
    errors.price = "Price field is reqired";
  }
  if (Validator.isEmpty(data.description)) {
    errors.description = "Description field is reqired";
  }
  if (Validator.isEmpty(data.subprojectId)) {
    errors.subprojectId = "Subproject field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
