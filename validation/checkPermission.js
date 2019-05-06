const isEmpty = require("./is-empty");

// Import models
const Organization = require("../models/Organization");

module.exports = function checkUserPermissions(
  user_id,
  organization,
  { position = "admin", searchOrganization = false } = {}
) {
  const permErrors = {};
  if (!searchOrganization) {
    // Check for valid user
    for (let member of organization.members) {
      if (
        member.user.toString() === user_id.toString() &&
        member.permissions === position
      ) {
        return { permErrors, isPermitted: isEmpty(permErrors) };
      }
    }
    permErrors.access = "Access denied";
    return { permErrors, isPermitted: isEmpty(permErrors) };
  } else {
    // Creating promise and resolving when access is allowed
    return new Promise((resolve, reject) => {
      Organization.findById(organization)
        .then(currentOrganization => {
          for (let member of currentOrganization.members) {
            if (
              member.user.toString() === user_id.toString() &&
              member.permissions === position
            ) {
              resolve("Access is allowed");
            }
          }
          reject({ access: "Access denied" });
        })
        .catch(err => console.log(err));
    });
  }
};
