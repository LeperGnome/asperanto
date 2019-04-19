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

//@route GET api/projects
//@desc  Get all of organization's projects
//@acces Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Organization.findById(req.user.organization)
      .populate({ path: "projects", populate: { path: "subprojects" } })
      .then(organization => {
        const { permErrors, isPermitted } = checkUserPermissions(
          req.user._id,
          organization
        );
        if (!isPermitted) {
          return res.status(403).json(permErrors);
        }
        res.json(organization.projects);
      });
  }
);

//@route POST api/projects/create
//@desc  Create new project
//@acces Private
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Organization.findById(req.user.organization)
      .populate("projects")
      .then(organization => {
        // Checking permissions
        const { permErrors, isPermitted } = checkUserPermissions(
          req.user._id,
          organization
        );
        if (!isPermitted) {
          return res.status(403).json(permErrors);
        }

        const { errors, isValid } = validateProjectInput(req.body);
        if (!isValid) {
          // Return input errors
          return res.status(400).json(errors);
        }
        // Creating a new project
        newProject = new Project({ name: req.body.name });
        newProject
          .save()
          .then(project => {
            res.json(project);
          })
          .catch(err => console.log(err));

        // Adding project to organization
        organization.projects.unshift(newProject._id);
        organization.save().catch(err => console.log(err));
      });
  }
);

//@route POST api/projects/:proj_id/subprojects/create
//@desc  Create new subproject
//@acces Private
router.post(
  "/:proj_id/subprojects/create",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Organization.findById(req.user.organization)
      .populate("projects")
      .then(organization => {
        // Check for valid mongoose id
        try {
          var project_id = mongoose.Types.ObjectId(req.params.proj_id);
        } catch (err) {
          return res.status(400).json({ error: "Incorret project id" });
        }

        Project.findById(project_id).then(project => {
          // Check if project exists
          if (!project) {
            return res.status(404).json({ error: "Project not found" });
          }

          // Checking permissions
          if (
            !organization.projects
              .map(project => project._id.toString())
              .includes(project._id.toString())
          ) {
            // if project does not belong to your organization
            return res.status(403).json({ error: "Foreign project" });
          }
          const { permErrors, isPermitted } = checkUserPermissions(
            req.user._id,
            organization
          );
          if (!isPermitted) {
            // if you do not have permissions to create project/subproject in your organization
            return res.status(403).json(permErrors);
          }

          // Input validation
          const { errors, isValid } = validateProjectInput(req.body);
          if (!isValid) {
            return res.status(400).json(errors);
          }
          // Creating a new project
          newSubproject = new Subproject({ name: req.body.name });
          newSubproject
            .save()
            .then(subproject => {
              res.json(subproject);
            })
            .catch(err => console.log(err));

          // Adding subproject to project
          project.subprojects.unshift(newSubproject._id);
          project.save().catch(err => console.log(err));
        });
      });
  }
);
module.exports = router;
