const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.middleName = !isEmpty(data.middleName) ? data.middleName : "";
  data.nickname = !isEmpty(data.nickname) ? data.nickname : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!Validator.isLength(data.firstName, { min: 2, max: 30 })) {
    errors.firstName = "First name must be between 2 and 30 characters";
  }
  if (!Validator.isLength(data.lastName, { min: 2, max: 30 })) {
    errors.lastName = "Last name must be between 2 and 30 characters";
  }
  if (!Validator.isLength(data.middleName, { min: 2, max: 30 })) {
    errors.middleName = "Middle name must be between 2 and 30 characters";
  }
  if (!Validator.isLength(data.nickname, { min: 2, max: 30 })) {
    errors.nickname = "Nickname must be between 2 and 30 characters";
  }

  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "First name field is reqired";
  }
  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "Last name field is reqired";
  }
  if (Validator.isEmpty(data.middleName)) {
    errors.middleName = "Middle name field is reqired";
  }
  if (Validator.isEmpty(data.nickname)) {
    errors.nickname = "Nickname field is reqired";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is reqired";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is reqired";
  }
  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be ay least 6 characters";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is reqired";
  }
  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
