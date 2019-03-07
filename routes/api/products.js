const express = require("express");
const passport = require("passport");

const router = express.Router();

// Import  models
const Organization = require("../../models/Organization");
const Product = require("../../models/Product");

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
  errors = {};
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

module.exports = router;
