const express = require("express");
const passport = require("passport");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const axios = require("axios");

// Import  models
const Organization = require("../../models/Organization");
const Invitation = require("../../models/Invitation");

//Import validators
const checkUserPermissions = require("../../validation/checkPermission");
const createUser = require("../../validation/createUser");

//@route GET api/invitations
//@desc  View all organization's invitations
//@acces Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Invitation.find({ organization: req.user.organization })
      .then(invitations => {
        // Check if organization has invitations
        if (invitations.length <= 0) {
          return res.status(404).json({ error: "Invitations not found" });
        }
        res.json(invitations);
      })
      .catch(err => console.log(err));
  }
);

//@route GET api/invitations/:id/check
//@desc  Check if invite is still active
//@acces Public
router.get("/:id/check_invite", (req, res) => {
  const errors = {};
  // Check for valid mongoose id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    errors.invitation = "Invalid invitation id";
    return res.status(400).json(errors);
  }
  Invitation.findById(req.params.id).then(invitation => {
    if (!invitation) {
      // if no invitation was found
      errors.invitation = "Invitation not found";
      return res.status(404).json(errors);
    }
    if (!invitation.active) {
      errors.invitation = "Invitation is no longer active";
      return res.status(400).json(errors);
    }
    // invite is valid and active
    res.json(invitation);
  });
});

//@route GET api/invitations/:id/cancel
//@desc  Cancel invitation
//@acces Private
router.post(
  "/:id/cancel",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    // Check for valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      errors.invitation = "Invalid invitation id";
      return res.status(400).json(errors);
    }

    // Check user permissions
    checkUserPermissions(req.user._id, req.user.organization, {
      searchOrganization: true
    })
      .then(access => {
        // if user have permissions
        Invitation.findById(req.params.id).then(invitation => {
          if (!invitation) {
            errors.invitation = "Invitation not found";
            return res.status(404).json(errors);
          }
          // Check if invitation is already
          if (!invitation.active) {
            errors.invitation = "Invitation already inactive";
            return res.status(400).json(errors);
          }
          // set invitation inactive
          invitation.active = false;
          invitation.save();
          res.json(invitation);
        });
      })
      .catch(err => res.status(403).json(err));
  }
);

//@route GET api/invitations/:id/submit
//@desc  Submit incoming invitation
//@acces Public
router.post("/:id/submit", (req, res) => {
  // Check for valid mongoose id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ invitation: "Invalid invitation id" });
  }

  Invitation.findById(req.params.id).then(invitation => {
    if (!invitation) {
      return res.status(404).json({ invitation: "Invitation not found" });
    }
    // Check if invitation is inactive
    if (!invitation.active) {
      return res.status(400).json({ invitation: "Invitation is inactive" });
    }

    // Validate user input
    const { errors, isValid } = createUser(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Accepting invitation
    invitation.active = false;
    invitation.accepted = true;
    invitation.save().catch(err => console.log(err));
    // Creating new user with requested parameters
    const avatar = gravatar.url(invitation.email, {
      s: "200", // Size
      r: "pg", // Rating
      d: "mm" // Default
    });

    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      middleName: req.body.middleName,
      nickname: req.body.nickname,
      email: invitation.email,
      avatar,
      password: req.body.password
    });

    // Create passoword
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => {
            // POST to Hyperledger server
            axios
              .post("http://87.236.23.98:3000/api/Users", {
                userId: user._id
              })
              .then(res => console.log(res.data))
              .catch(err => console.log(err));

            Organization.findById(invitation.organization.toString())
              .then(organization => {
                // Adding new member to organization
                organization.members.unshift({
                  user: user._id,
                  permissions: invitation.permissions
                });

                // Saving organization
                organization.save().catch(err => console.log(err));

                // Creating profile for user
                newProfile = new Profile({ user });

                // Adding organization to user profile
                newProfile.organization.position = invitation.position;
                newProfile.organization.comId = organization._id;
                newProfile.organization.current = true;

                newProfile.save().catch(err => console.log(err));

                res.json(user);
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      });
    });
  });
});

//@route GET api/invitations/:id
//@desc  View organizaion's invitaion by id
//@acces Private
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Check for valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid invitation id" });
    }
    Invitation.find({ organization: req.user.organization, _id: req.params.id })
      .then(invitation => {
        // Check if organization has invitation with that id
        if (invitation.length <= 0) {
          return res.status(404).json({ error: "Invitation not found" });
        }
        res.json(invitation[0]);
        // Using only the first element because .find() returns an array or objects, but id parameter is used, so it will return 1 object maximum
      })
      .catch(err => console.log(err));
  }
);

module.exports = router;
