const express = require("express");
const passport = require("passport");
const axios = require("axios");

const router = express.Router();

// Import  models
const Organization = require("../../models/Organization");
const Product = require("../../models/Product");
const TradeRequest = require("../../models/TradeRequest");

//Import validators
const checkUserPermissions = require("../../validation/checkPermission");

//@route GET api/products
//@desc  Get all products
//@acces Public
router.get("/", (req, res) => {
  errors = {};
  Product.find(
    {},
    {
      name: true,
      image: true,
      price: true,
      description: true
    }
  )
    .populate("organization", ["name", "_id"])
    .then(products => {
      if (!products) {
        errors.noproducts = "No products found";
        return res.status(404).json(errors);
      }
      res.json(products);
    })
    .catch(err => res.status(400).json(err));
});

//@route GET api/products/:prod_id
//@desc  Get info about product
//@acces Public
router.get("/:prod_id", (req, res) => {
  const errors = {};
  Product.countDocuments({ _id: req.params.prod_id }, (err, count) => {
    if (count > 0) {
      Product.findById(req.params.prod_id).then(product => {
        return res.json(product);
      });
    } else {
      errors.product = "Product not found";
      return res.status(404).json(errors);
    }
  });
});

//@route GET api/products/:prod_id/create_request
//@desc  Create trade request
//@acces Private
router.post(
  "/:prod_id/create_request",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Product.countDocuments({ _id: req.params.prod_id }, (err, count) => {
      if (count > 0) {
        Product.findById(req.params.prod_id).then(product => {
          Organization.findById(req.user.organization)
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

              // If user is valid member of company with permissions
              const requestFields = {
                manufacturer: product.organization._id,
                developer: organization._id,
                product: product._id,
                unitCount: req.body.unitCount,
                unitPrice: product.price,
                dateOfManufacture: "2019-03-21T09:37:16.788Z"
              };
              const newRequest = new TradeRequest(requestFields);

              newRequest.save().then(tradeRequest => {
                axios
                  .post("http://87.236.23.98:3000/api/Manufacture", {
                    manufactureId: tradeRequest._id,
                    status: tradeRequest.status,
                    manufacturer: tradeRequest.manufacturer,
                    customer: tradeRequest.developer,
                    product: tradeRequest.product,
                    dateOfManufacture: tradeRequest.dateOfManufacture,
                    unitPrice: tradeRequest.unitPrice,
                    unitCount: tradeRequest.unitCount
                  })
                  .then(res => console.log(res.data))
                  .catch(err => console.log(err));
              });
              return res.json(newRequest);
            })
            .catch(err => res.json(err));
        });
      } else {
        errors.product = "Product not found";
        return res.status(404).json(errors);
      }
    });
  }
);

module.exports = router;
