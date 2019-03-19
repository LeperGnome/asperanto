const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const axios = require("axios");

const router = express.Router();

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//Load user model
const User = require("../../models/User");

//Load Profile model
const Profile = require("../../models/Profile");

//@route POST /accounts/register
//@desc  Register user
//@acces Public
router.post("/register", (req, res) => {
  // Check validation
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({
    $or: [{ email: req.body.email }, { nickname: req.body.nickname }]
  }).then(user => {
    if (user) {
      // Checking if there is user with requested email or nickname
      if (user.email === req.body.email) {
        errors.email = "Email already exists";
      }
      if (user.nickname === req.body.nickname) {
        errors.nickname = "Nickname already exists";
      }
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size
        r: "pg", // Rating
        d: "mm" // Default
      });

      // Creating new user with requested parameters
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        middleName: req.body.middleName,
        nickname: req.body.nickname,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              // Creating profile for user
              newProfile = new Profile({ user });
              newProfile.save().catch(err => console.log(err));

              // POST to Hyperledger server
              axios
                .post("http://87.236.23.98:3000/api/Users", {
                  userId: user._id
                })
                .then(res => console.log(res.status))
                .catch(err => console.log(err));

              res.json(user);
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route POST api/accounts/login
//@desc  Login user / Returning token
//@acces Public
router.post("/login", (req, res) => {
  // Check validation
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    //Check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    //Check password
    bcrypt.compare(password, user.password).then(isMatsh => {
      if (isMatsh) {
        // User matched
        // Create jwt payload
        const payload = {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar
        };

        // Signtoken
        jwt.sign(
          payload,
          keys.secreatOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password is incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

//@route GET api/accounts/current
//@desc  Return current loged user by token
//@acces private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    const loggedUser = req.user;
    Profile.findOne({ user: loggedUser.id })
      .then(profile => {
        if (!profile) {
          errors.profile = "Profile not found";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(400).json(err));
  }
);

//@route GET api/accounts/profile
//@desc  Return loged user profile
//@acces private
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .populate("user", [
        "firstName",
        "lastName",
        "middleName",
        "avatar",
        "nickname",
        "email"
      ])
      .then(profile => res.json(profile))
      .catch(err => res.status(400).json());
  }
);

//@route GET api/accounts/
//@desc  Return all users
//@acces public
router.get("/", (req, res) => {
  errors = {};
  User.find(
    {},
    {
      // Getting only specific fields from users
      firstName: true,
      middleName: true,
      lastName: true,
      nickname: true,
      avatar: true
    }
  )
    .then(users => {
      if (!users) {
        errors.nousers = "There are no users yet";
        res.status(404).json(errors);
      }
      res.json(users);
    })
    .catch(err => res.status(400).json(err));
});

//@route GET api/accounts/:nickname
//@desc  Return public info about user (profile + some name fields)
//@acces public
router.get("/:nickname", (req, res) => {
  errors = {};
  User.findOne({ nickname: req.params.nickname })
    .then(user => {
      if (!user) {
        errors.nouser = "User not found";
        return res.status(404).json(errors);
      }
      Profile.findOne({ user: user.id })
        .populate("user", [
          "firstName",
          "lastName",
          "middleName",
          "nickname",
          "avatar"
        ])
        .then(profile => {
          if (!profile) {
            errors.nouser = "User not found";
            return res.status(404).json(errors);
          }
          res.json(profile);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

module.exports = router;
