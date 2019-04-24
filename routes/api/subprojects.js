const express = require("express");
const passport = require("passport");
const axios = require("axios");
const mongoose = require("mongoose");

const router = express.Router();

// Import  models
const Organization = require("../../models/Organization");
const Project = require("../../models/Project");
const Subproject = require("../../models/Subproject");
const TradeRequest = require("../../models/TradeRequest");

//Import validators
const checkUserPermissions = require("../../validation/checkPermission");
const validateProjectInput = require("../../validation/createProject");

//@route GET api/subprojects
//@desc  View all subprojects
//@acces Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Subproject.find({ organization: req.user.organization })
      .populate("tradeRequests")
      .then(subprojects => {
        if (subprojects.length == 0) {
          return res.status(404).json({ subprojects: "Subprojects not found" });
        }
        return res.json(subprojects);
      });
  }
);

//@route GET api/subprojects/:subproject_id
//@desc  View subproject
//@acces Private
router.get(
  "/:subproject_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    // Check for valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(req.params.subproject_id)) {
      errors.subproject = "Invalid subpoject id";
      return res.status(400).json(errors);
    }

    Subproject.findById(req.params.subproject_id)
      .populate({
        path: "tradeRequests",
        populate: { path: "provider", select: ["name", "avatar"] }
      })
      .then(subproject => {
        const errors = {};
        if (!subproject) {
          errors.subproject = "Subproject not found";
          return res.status(404).json(errors);
        }
        // Check if subproject is in your organization
        if (
          req.user.organization.toString() !==
          subproject.organization._id.toString()
        ) {
          errors.subproject = "Foreign subproject";
          return res.status(403).json(errors);
        }

        return res.json(subproject);
      });
  }
);

module.exports = router;
