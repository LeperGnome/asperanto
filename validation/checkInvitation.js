const Validator = require("validator");
const isEmpty = require("./is-empty");

const permissionsList = ["admin", "viewer"];

module.exports = function checkInvitationInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.permissions = !isEmpty(data.permissions) ? data.permissions : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Invalid email format";
  }
  if (!permissionsList.includes(data.permissions)) {
    errors.permissions = "Unknown permissions";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is reqired";
  }
  if (Validator.isEmpty(data.permissions)) {
    errors.permissions = "Permissions field is reqired";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
