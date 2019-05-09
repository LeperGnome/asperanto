const express = require("express");
const passport = require("passport");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const slug = require("slug");
const axios = require("axios");

const router = express.Router();

// Import  models
const Organization = require("../../models/Organization");
const Product = require("../../models/Product");
const Service = require("../../models/Service");
const Profile = require("../../models/Profile");
const Invitation = require("../../models/Invitation");
const User = require("../../models/User");

// Import validation
const checkInvitationInput = require("../../validation/checkInvitation");
const checkUserPermissions = require("../../validation/checkPermission");
const validateRegisterOrgInput = require("../../validation/registerOrganization");

// Import create product input valiadtion
const validateCreateProductOrServiceInput = require("../../validation/createProductOrService");

//@route POST api/organizations/register
//@desc  Register organization and user
//@acces Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterOrgInput(req.body);

  // Check for input errors
  if (!isValid) {
    //Return any errors
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
      // Checking if organization urlName already exists
      Organization.findOne({ urlName: req.body.urlName }).then(organization => {
        if (organization) {
          console.log(organization);
          return res.status(400).json({ error: "urlName already exists" });
        }
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

        // Create passoword
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                // Creating profile for user
                newProfile = new Profile({ user });

                // POST to Hyperledger server
                axios
                  .post("http://87.236.23.98:3000/api/Users", {
                    userId: user._id
                  })
                  .then(res => console.log(res.data))
                  .catch(err => console.log(err));

                console.log(user);

                //
                // Create Organization
                //
                newOrganization = new Organization({
                  name: req.body.orgName,
                  urlName: req.body.urlName,
                  industries: req.body.industries.split(","),
                  businessType: req.body.businessType,
                  countryOfIncorporation: req.body.countryOfIncorporation
                });

                // Adding creator to company members as administrator
                newOrganization.members.unshift({
                  user: user._id,
                  permissions: "admin"
                });

                // Saving organization
                newOrganization
                  .save()
                  .then(organization => console.log(organization))
                  .catch(err => console.log(err));

                // Adding organization to user profile
                newProfile.organization.position = "admin";
                newProfile.organization.comId = newOrganization._id;
                newProfile.organization.current = true;

                newProfile.save().catch(err => console.log(err));

                res.json({ msg: "Success" });
                // POST new organization to Hyperledger server

                const organizationFields = {
                  organizationId: newOrganization._id,
                  asperantoType: "CUSTOMER",
                  accountBalance: 1000
                };
                axios
                  .post(
                    "http://87.236.23.98:3000/api/Organization",
                    organizationFields
                  )
                  .then(res => console.log(res.data))
                  .catch(err => console.log(err.data));
              })
              .catch(err => console.log(err));
          });
        });
      });
    }
  });
});

//@route POST api/organizations/add_member
//@desc  Add new member to organization
//@acces Private
router.post(
  "/add_member",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Check invitation input
    const { errors, isValid } = checkInvitationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Organization.findById(req.user.organization).then(organization => {
      // Check user permissions
      const { permErrors, isPermitted } = checkUserPermissions(
        req.user._id,
        organization
      );

      if (!isPermitted) {
        return res.status(403).json(permErrors);
      }

      //Check for invitation with given email
      Invitation.find({ email: req.body.email, active: true })
        .then(invitations => {
          if (invitations.length > 0) {
            errors.email = "This user is already invited";
            return res.status(400).json(errors);
          }
          // Check for user with given email
          User.find({ email: req.body.email })
            .then(users => {
              if (users.length > 0) {
                errors.email = "User with this email already exists";
                return res.status(400).json(errors);
              }
              // If email was never user in system
              let invitationFields = req.body;
              invitationFields.organization = req.user.organization;

              const newInvitation = new Invitation(invitationFields);
              newInvitation.save().catch(err => {
                return res.status(400).json(err);
              });

              return res.json(newInvitation);
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
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
      registeredFrom: true,
      urlName: true
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

//@route GET api/organizations/:org_urlname/products
//@desc  View organization's products
//@acces public
router.get("/:org_urlname/products", (req, res) => {
  Organization.findOne({ urlName: req.params.org_urlname })
    .then(organization => {
      //check for valid url name
      if (!organization) {
        return res.status(404).json({ organization: "Organization not found" });
      }
      Product.find({ organization: organization._id }).then(products => {
        if (products.length <= 0) {
          return res.status(404).json({ products: "Products not found" });
        }
        res.json(products);
      });
    })
    .catch(err => console.log(err));
});

//@route POST api/organizations/:org_urlname/products/create
//@desc  Create product
//@acces Private
router.post(
  "/:org_urlname/products/create",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Organization.findOne({ urlName: req.params.org_urlname })
      .then(organization => {
        //check for valid url name
        if (!organization) {
          return res
            .status(404)
            .json({ organization: "Organization not found" });
        }
        // check user permissions
        const { permErrors, isPermitted } = checkUserPermissions(
          req.user.id,
          organization
        );
        if (!isPermitted) return res.status(403).json(permErrors);

        // Product creation
        let { errors, isValid } = validateCreateProductOrServiceInput(req.body);
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
        if (req.body.innerId) productFields.innerId = req.body.innerId;
        if (req.body.potencial) productFields.potencial = req.body.potencial;

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
        // check user permissions
        const { permErrors, isPermitted } = checkUserPermissions(
          req.user.id,
          organization
        );
        if (!isPermitted) return res.status(403).json(permErrors);

        // Service creation
        let { errors, isValid } = validateCreateProductOrServiceInput(req.body);
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
        avatar: organization.avatar,
        industries: organization.industries,
        type: organization.type,
        countryOfIncorporation: organization.countryOfIncorporation,
        registeredFrom: organization.registeredFrom,
        productsList: organization.productsList,
        servicesList: organization.servicesList,
        tags: organization.tags,
        urlName: organization.urlName
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
      .populate({ path: "projects", populate: { path: "subprojects" } })
      .then(organization => {
        // Check for valid organization url name
        if (!organization) {
          errors.organization = "Organization not found";
          return res.status(404).json(errors);
        }
        // check user permissions
        const { permErrors, isPermitted } = checkUserPermissions(
          req.user.id,
          organization
        );
        if (!isPermitted) return res.status(403).json(permErrors);

        return res.json(organization);
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
            // Check user permissions
            const { permErrors, isPermitted } = checkUserPermissions(
              req.user.id,
              organization
            );
            if (!isPermitted) return res.status(403).json(permErrors);

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
            if (req.body.tags) newProductParams.tags = req.body.tags.split(",");
            if (req.body.description)
              newProductParams.description = req.body.description;
            if (req.body.innerId) productFields.innerId = req.body.innerId;
            if (req.body.potencial)
              productFields.potencial = req.body.potencial;

            Product.findByIdAndUpdate(
              req.params.prod_id,
              { $set: newProductParams },
              { new: true }
            ).catch(err => res.status(400).json(err));
            return res.json(newProductParams);
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
            // Check user permissions
            const { permErrors, isPermitted } = checkUserPermissions(
              req.user.id,
              organization
            );
            if (!isPermitted) return res.status(403).json(permErrors);
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
            // Check user permissions
            const { permErrors, isPermitted } = checkUserPermissions(
              req.user.id,
              organization
            );
            if (!isPermitted) return res.status(403).json(permErrors);
            // Remove service id from organizstion list
            const removeIndex = organization.servicesList
              .map(item => item._id.toString())
              .indexOf(req.params.serv_id.toString());

            organization.servicesList.splice(removeIndex, 1);
            organization.save();

            // Delete actual object
            Service.findByIdAndDelete(req.params.serv_id).catch(err =>
              res.status(400).json(err)
            );
            return res.json({ msg: "Service successfully deleted" });
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
            // check user permissions
            const { permErrors, isPermitted } = checkUserPermissions(
              req.user.id,
              organization
            );
            if (!isPermitted) return res.status(403).json(permErrors);
            // Remove product id from organizstion list
            const removeIndex = organization.productsList
              .map(item => item._id.toString())
              .indexOf(req.params.prod_id.toString());

            organization.productsList.splice(removeIndex, 1);
            organization.save();

            // Delete actual object
            Product.findByIdAndDelete(req.params.prod_id).catch(err =>
              res.status(400).json(err)
            );
            return res.json({ msg: "Product successfully deleted" });
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
