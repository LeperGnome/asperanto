const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

const router = express.Router();

// Import organization model
const Organization = require("../../models/Organization");

// Import product model
const Product = require("../../models/Product");

// Import create organization input valdation
const validateCreateOrganizationInput = require("../../validation/createOrganization");

// Import create product input valiadtion
const validateCreateProductInput = require("../../validation/createProduct");

//@route POST api/organizations/create
//@desc  Create organization
//@acces Private
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCreateOrganizationInput(req.body);
    //Check validation
    if (!isValid) {
      //Return any errors
      return res.status(400).json(errors);
    }

    newOrganization = new Organization({
      name: req.body.name,
      industries: req.body.industries.split(","),
      type: req.body.type.split(","),
      businessType: req.body.businessType,
      countryOfIncorporation: req.body.countryOfIncorporation
    });

    // Adding creator to company members as administrator
    newOrganization.members.unshift({
      user: req.user.id,
      permissions: "admin"
    });

    newOrganization
      .save()
      .then(organization => res.json(organization))
      .catch(err => res.status(400).json(err));
  }
);

//@route GET api/organizations/all
//@desc  Get limited info about all organizations
//@acces Public
router.get("/all", (req, res) => {
  const errors = {};
  Organization.find(
    {},
    {
      name: true,
      industries: true,
      type: true,
      countryOfIncorporation: true,
      registeredFrom: true
    }
  )
    .then(organizations => {
      if (!organizations) {
        errors.organization = "Organizations not found";
        return res.status(404).json(errors);
      }
      return res.json(organizations);
    })
    .catch(err => res.status(400).json(err));
});

//@route POST api/organizations/:org_urlname/products/create
//@desc  Create product
//@acces Private
router.post(
  "/:org_urlname/products/create",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Organization.findOne({ urlName: req.params.org_urlname })
      .then(organization => {
        //check for valid url name
        if (!organization) {
          errors.organization = "Organization not found";
          return res.status(404).json(errors);
        }
        // Check for valid user
        for (let member of organization.members) {
          if (
            member.user.toString() === req.user.id &&
            member.permissions === "admin"
          ) {
            // If user is valid member of company with permissions

            // Product creation
            let { inputErrors, isValid } = validateCreateProductInput(req.body);
            // Check input validation
            if (!isValid) {
              return res.status(400).json(inputErrors);
            }

            // Create product obj
            newProduct = new Product({
              name: req.body.name,
              description: req.body.description,
              price: req.body.price
            });

            // Save
            newProduct
              .save()
              .then(product => {
                // Add product to organization list
                organization.productsList.unshift(product);
              })
              .catch(err => console.log(err));
            return res.json(newProduct);
          }
        }
        errors.access = "Access denied";
        res.status(403).json(errors); // ? Если это удалить, то норм, не знаю в чем проблема
      })
      .catch(err => res.json(err));
  }
);

//@route GET api/organizations/:org_urlname
//@desc  Get limited info about organiation
//@acces Public
router.get("/:org_urlname", (req, res) => {
  const errors = {};
  Organization.findOne({ urlName: req.params.org_urlname })
    .then(organization => {
      if (!organization) {
        errors.organization = "Organization not found";
        return res.status(404).json(errors);
      }

      // Pick info for response
      const orgPublicInfo = {
        name: organization.name,
        industries: organization.industries,
        type: organization.type,
        countryOfIncorporation: organization.countryOfIncorporation,
        registeredFrom: organization.registeredFrom,
        productsList: organization.productsList,
        servicesList: organization.servicesList
      };
      res.json(orgPublicInfo);
    })
    .catch(err => res.status(400).json(err));
});

//@route GET api/organizations/:org_urlname/private
//@desc  Get all info about organization
//@acces Private
router.get(
  "/:org_urlname/private",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Organization.findOne({ urlName: req.params.org_urlname })
      .then(organization => {
        if (!organization) {
          errors.organization = "Organization not found";
          return res.status(404).json(errors);
        }

        // Check for valid user
        for (let member of organization.members) {
          if (
            member.user.toString() === req.user.id &&
            member.permissions === "admin"
          ) {
            return res.json(organization);
          }
        }
        errors.access = "Access denied";
        res.status(403).json(errors);
      })
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router;
