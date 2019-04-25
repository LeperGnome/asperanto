const express = require("express");
const passport = require("passport");

const router = express.Router();

// Import  models
const Organization = require("../../models/Organization");
const Service = require("../../models/Service");

//Import Validators
const validateSearchInput = require("../../validation/checkSearchField");

//@route GET api/products
//@desc  Get all products
//@acces Private
router.get("/", (req, res) => {
  errors = {};
  Service.find(
    {},
    {
      name: true,
      image: true,
      price: true,
      description: true,
      organization: true,
      potencial: true,
      tags: true
    }
  )
    .then(services => {
      if (!services) {
        errors.noservices = "No services found";
        return res.status(404).json(errors);
      }
      res.json(services);
    })
    .catch(err => res.status(400).json(err));
});

//@route POST api/services/search
//@desc  Services text search
//@acces Public
router.post("/search", (req, res) => {
  // Check input errors
  const { errors, isValid } = validateSearchInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Service.find(
    { $text: { $search: req.body.text } },
    {
      name: true,
      tags: true,
      price: true,
      potencial: true,
      addDate: true,
      image: true,
      organization: true,
      description: true
    }
  )
    .then(services => {
      if (services.length == 0) {
        // if no services are found
        return res.json({ services: "Ничего не найдено" });
      }
      res.json(services);
    })
    .catch(err => console.log(err));
});

//@route GET api/services/:serv_id
//@desc  Get info about servise
//@acces Public
router.get("/:serv_id", (req, res) => {
  errors = {};
  Service.countDocuments({ _id: req.params.serv_id }, (err, count) => {
    if (count > 0) {
      Service.findById(req.params.serv_id).then(service => {
        return res.json(service);
      });
    } else {
      errors.service = "Service not found";
      return res.status(404).json(errors);
    }
  });
});

module.exports = router;
