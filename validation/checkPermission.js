const isEmpty = require("./is-empty");

module.exports = function checkUserPermissions(
  user_id,
  organization,
  position = "admin"
) {
  const permErrors = {};
  // Check for valid user
  for (let member of organization.members) {
    if (member.user.toString() === user_id && member.permissions === position) {
      return { permErrors, isPermitted: isEmpty(permErrors) };
    }
  }
  permErrors.access = "Access denied";
  return { permErrors, isPermitted: isEmpty(permErrors) };
};
