const express = require("express");
const passport = require("passport");

const router = express.Router();

// Import  models
const Organization = require("../../models/Organization");
const Service = require("../../models/Service");

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
      description: true
    }
  )
    .populate("organization", ["name", "urlName"])
    .then(services => {
      if (!services) {
        errors.noservices = "No services found";
        return res.status(404).json(errors);
      }
      res.json(services);
    })
    .catch(err => res.status(400).json(err));
});

//@route GET api/services/:serv_id
//@desc  Get info about servise
//@acces Public
router.get("/:serv_id", (req, res) => {
  errors = {};
  Service.countDocuments({ _id: req.params.serv_id }, (err, count) => {
    if (count > 0) {
      Service.findById(req.params.serv_id)
        .populate("organization", ["name", "urlName"])
        .then(service => {
          return res.json(service);
        });
    } else {
      errors.service = "Service not found";
      return res.status(404).json(errors);
    }
  });
});

module.exports = router;
