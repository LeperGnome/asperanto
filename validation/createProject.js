const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProjectInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";

  if (!Validator.isLength(data.name, { min: 2, max: 60 })) {
    errors.name = "Name must be between 2 and 60 characters";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is reqired";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
