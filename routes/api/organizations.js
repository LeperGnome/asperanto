const express = require("express");
const passport = require("passport");
const slug = require("slug");
const axios = require("axios");

const router = express.Router();

// Import  models
const Organization = require("../../models/Organization");
const Product = require("../../models/Product");
const Service = require("../../models/Service");
const Profile = require("../../models/Profile");

// Import create organization input valdation
const validateCreateOrganizationInput = require("../../validation/createOrganization");

// Import create product input valiadtion
const validateCreateProductOrServiceInput = require("../../validation/createProductOrService");

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

    // Create urlName with slug
    const urlName = slug(req.body.name, { lower: true, replacement: "_" });
    Organization.count({ urlName }, (err, count) => {
      if (count > 0) {
        //
        // EDIT FILE createOrganizationUrlName.js
        //
      }
    });

    newOrganization = new Organization({
      name: req.body.name,
      urlName: req.body.urlName,
      industries: req.body.industries.split(","),
      businessType: req.body.businessType,
      countryOfIncorporation: req.body.countryOfIncorporation
    });

    // Adding creator to company members as administrator
    newOrganization.members.unshift({
      user: req.user.id,
      permissions: "admin"
    });

    // Saving organization
    newOrganization
      .save()
      .then(organization => res.json(organization))
      .catch(err => res.status(400).json(err));

    // Adding organization to profile
    Profile.findOne({ user: req.user.id })
      .populate("user", ["email"])
      .then(profile => {
        if (!profile) {
          errors.profile = "Profile not found";
          return res.status(404).json(errors);
        }

        profile.organizations.unshift({
          comid: newOrganization._id,
          position: "admin",
          current: true
        });
        profile.save().catch(err => res.status(400).json(err));

        // POST new organization to Hyperledger server
        /*
        const manufacturerFields = {
          email: profile.user.email,
          accountBalance: 228,
          address: {
            city: "Moscow",
            country: "Russia",
            street: "Pushkina",
            zip: "123321"
          }
        };
        axios
          .post("http://87.236.23.98:3000/api/Manufacturer", manufacturerFields)
          .then(res => console.log(res))
          .catch(err => console.log(err.data));
        */
      });
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
      asperantoType: true,
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
            let { errors, isValid } = validateCreateProductOrServiceInput(
              req.body
            );
            // Check input validation
            if (!isValid) {
              return res.status(400).json(errors);
            }

            const productFields = {};

            productFields.name = req.body.name;
            productFields.price = req.body.price;
            productFields.description = req.body.description;
            productFields.organization = organization._id;
            if (req.body.tags) productFields.tags = req.body.tags.split(",");
            if (req.body.image) productFields.image = req.body.image;

            // Create product obj
            newProduct = new Product(productFields);

            // Save
            newProduct
              .save()
              .then(product => {
                // Add product to organization list
                addAsperantoType = "Производитель";
                organization.productsList.unshift(product);

                // Add asperanto type if not exists
                if (!organization.asperantoType.includes(addAsperantoType)) {
                  organization.asperantoType.unshift(addAsperantoType);
                }

                organization.save().catch(err => res.status(400).json(err));
              })
              .catch(err => console.log(err));
            return res.json(newProduct);
          }
        }
        errors.access = "Access denied";
        res.status(403).json(errors);
      })
      .catch(err => res.json(err));
  }
);

//@route POST api/organizations/:org_urlname/services/create
//@desc  Create service
//@acces Private
router.post(
  "/:org_urlname/services/create",
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

            // Service creation
            let { errors, isValid } = validateCreateProductOrServiceInput(
              req.body
            );
            // Check input validation
            if (!isValid) {
              return res.status(400).json(errors);
            }

            const serviceFields = {};

            serviceFields.name = req.body.name;
            serviceFields.price = req.body.price;
            serviceFields.description = req.body.description;
            serviceFields.organization = organization._id;
            if (req.body.tags) serviceFields.tags = req.body.tags.split(",");
            if (req.body.image) serviceFields.image = req.body.image;

            // Create product obj
            newService = new Service(serviceFields);

            // Save
            newService
              .save()
              .then(service => {
                // Add product to organization list
                addAsperantoType = "Поставщик услуг";
                organization.servicesList.unshift(service);

                // Add asperanto type if not exists
                if (!organization.asperantoType.includes(addAsperantoType)) {
                  organization.asperantoType.unshift(addAsperantoType);
                }

                organization.save().catch(err => res.status(400).json(err));
              })
              .catch(err => console.log(err));
            return res.json(newService);
          }
        }
        errors.access = "Access denied";
        res.status(403).json(errors);
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
    .populate("productsList")
    .populate("servicesList")
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
      .populate("productsList")
      .populate("servicesList")
      .then(organization => {
        // Check for valid organization url name
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

//@route POST api/organizations/:org_urlname/products/:prod_id/edit
//@desc  Edit product
//@acces Private
router.post(
  "/:org_urlname/products/:prod_id/edit",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Organization.findOne({ urlName: req.params.org_urlname }).then(
      organization => {
        // Check for valid organization url name
        if (!organization) {
          errors.organization = "Organization not found";
          return res.status(404).json(errors);
        }

        // Check for valid product id
        Product.count({ _id: req.params.prod_id }, (err, count) => {
          if (count > 0) {
            // Check for valid user
            for (let member of organization.members) {
              if (
                member.user.toString() === req.user.id &&
                member.permissions === "admin"
              ) {
                // Edit
                let { errors, isValid } = validateCreateProductOrServiceInput(
                  req.body
                );
                if (!isValid) {
                  return res.status(400).json(errors);
                }

                newProductParams = {};
                if (req.body.name) newProductParams.name = req.body.name;
                if (req.body.image) newProductParams.image = req.body.image;
                if (req.body.price) newProductParams.price = req.body.price;
                if (req.body.tags) newProductParams.tags = req.body.tags;
                if (req.body.description)
                  newProductParams.description = req.body.description;

                Product.findByIdAndUpdate(
                  req.params.prod_id,
                  { $set: newProductParams },
                  { new: true }
                ).catch(err => res.status(400).json(err));
                return res.json(newProductParams);
              }
            }
            errors.access = "Access denied";
            res.status(403).json(errors);
          } else {
            errors.product = "Product not found";
            return res.status(404).json(errors);
          }
        });
      }
    );
  }
);

//@route POST api/organizations/:org_urlname/services/:serv_id/edit
//@desc  Edit service
//@acces Private
router.post(
  "/:org_urlname/services/:serv_id/edit",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Organization.findOne({ urlName: req.params.org_urlname })
      .then(organization => {
        // Check for valid organization url name
        if (!organization) {
          errors.organization = "Organization not found";
          return res.status(404).json(errors);
        }
        // Check for valid service id
        Service.count({ _id: req.params.serv_id }, (err, count) => {
          if (count > 0) {
            // Check for valid user
            for (let member of organization.members) {
              if (
                member.user.toString() === req.user.id &&
                member.permissions === "admin"
              ) {
                // Edit
                let { errors, isValid } = validateCreateProductOrServiceInput(
                  req.body
                );
                if (!isValid) {
                  return res.status(400).json(errors);
                }

                newServiceParams = {};
                if (req.body.name) newServiceParams.name = req.body.name;
                if (req.body.image) newServiceParams.image = req.body.image;
                if (req.body.price) newServiceParams.price = req.body.price;
                if (req.body.tags) newServiceParams.tags = req.body.tags;
                if (req.body.description)
                  newServiceParams.description = req.body.description;

                Service.findByIdAndUpdate(
                  req.params.serv_id,
                  { $set: newServiceParams },
                  { new: true }
                ).catch(err => res.status(400).json(err));
                return res.json(newServiceParams);
              }
            }
            errors.access = "Access denied";
            res.status(403).json(errors);
          } else {
            errors.service = "Service not found";
            return res.status(404).json(errors);
          }
        });
      })
      .catch(err => res.status(400).json(err));
  }
);

//@route DELETE api/organizations/:org_urlname/services/:serv_id/delete
//@desc  Delete service
//@acces Private
router.delete(
  "/:org_urlname/services/:serv_id/delete",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Organization.findOne({ urlName: req.params.org_urlname })
      .then(organization => {
        // Check for valid organization url name
        if (!organization) {
          errors.organization = "Organization not found";
          return res.status(404).json(errors);
        }
        // Check for valid service id
        Service.countDocuments({ _id: req.params.serv_id }, (err, count) => {
          if (count > 0) {
            // Check for valid user
            for (let member of organization.members) {
              if (
                member.user.toString() === req.user.id &&
                member.permissions === "admin"
              ) {
                // Remove service id from organizstion list
                const removeIndex = organization.servicesList
                  .map(item => item.id)
                  .indexOf(req.params.serv_id);

                organization.servicesList.splice(removeIndex, 1);
                organization.save();

                // Delete actual object
                Service.findByIdAndDelete(req.params.serv_id).catch(err =>
                  res.status(400).json(err)
                );
                return res.json({ msg: "Service successfully deleted" });
              }
            }
            errors.access = "Access denied";
            res.status(403).json(errors);
          } else {
            errors.service = "Service not found";
            return res.status(404).json(errors);
          }
        });
      })
      .catch(err => res.status(400).json(err));
  }
);

//@route DELETE api/organizations/:org_urlname/products/:prod_id/delete
//@desc  Delete product
//@acces Private
router.delete(
  "/:org_urlname/products/:prod_id/delete",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Organization.findOne({ urlName: req.params.org_urlname })
      .then(organization => {
        // Check for valid organization url name
        if (!organization) {
          errors.organization = "Organization not found";
          return res.status(404).json(errors);
        }
        // Check for valid product id
        Product.countDocuments({ _id: req.params.prod_id }, (err, count) => {
          if (count > 0) {
            // Check for valid user
            for (let member of organization.members) {
              if (
                member.user.toString() === req.user.id &&
                member.permissions === "admin"
              ) {
                // Remove product id from organizstion list
                const removeIndex = organization.productsList
                  .map(item => item.id)
                  .indexOf(req.params.prod_id);

                organization.productsList.splice(removeIndex, 1);
                organization.save();

                // Delete actual object
                Product.findByIdAndDelete(req.params.prod_id).catch(err =>
                  res.status(400).json(err)
                );
                return res.json({ msg: "Product successfully deleted" });
              }
            }
            errors.access = "Access denied";
            res.status(403).json(errors);
          } else {
            errors.product = "Product not found";
            return res.status(404).json(errors);
          }
        });
      })
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router;
