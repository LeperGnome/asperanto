const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.price = !isEmpty(data.price) ? data.price : "";
  data.description = !isEmpty(data.description) ? data.description : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 characters";
  }
  if (!Validator.isLength(data.description, { min: 10 })) {
    errors.description = "Description must be at least 10 characters";
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

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
