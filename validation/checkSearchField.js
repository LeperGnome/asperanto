const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateSearchInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, { max: 256 })) {
    errors.text = "Text must be less then 256 characters";
  }

  if (Validator.isEmpty(data.text)) {
    errors.text = "Text field is reqired";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
