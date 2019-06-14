const express = require("express");
const passport = require("passport");

const router = express.Router();

// Import  models
const Product = require("../../models/Product");
const TradeRequest = require("../../models/TradeRequest");

//@route GET api/tardeRequests/view/incoming
//@desc  View all incoming requiests
//@acces Private
router.get(
  "/view/incoming",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TradeRequest.find({ provider: req.user.organization })
      .populate("product", ["name"])
      .then(tradeRequests => {
        if (tradeRequests.length <= 0) {
          return res
            .status(404)
            .json({ tradeRequests: "No incoming requests found" });
        }
        res.json(tradeRequests);
      })
      .catch(err => console.log(err));
  }
);

//@route GET api/tardeRequests/view/outgoing
//@desc  View all outgoing requiests
//@acces Private
router.get(
  "/view/outgoing",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TradeRequest.find({ receiver: req.user.organization })
      .populate("product")
      .then(tradeRequests => {
        if (tradeRequests.length <= 0) {
          return res
            .status(404)
            .json({ tradeRequests: "No outgoing requests found" });
        }
        res.json(tradeRequests);
      })
      .catch(err => console.log(err));
  }
);

//@route GET api/tardeRequests/view/:prod_id
//@desc  View requests for product
//@acces Private
router.get(
  "/view/:prod_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Checking if product eists
    Product.countDocuments({ _id: req.params.prod_id }, (err, count) => {
      if (count > 0) {
        // Product found
        Product.findById(req.params.prod_id)
          .then(product => {
            // Check if priduct is from user's organizaton
            if (
              product.organization.toString() !==
              req.user.organization.toString()
            ) {
              return res.status(403).json({ error: "Access denied" });
            }

            TradeRequest.find({
              provider: req.user.organization,
              product: product._id
            })
              .populate()
              .then(tradeRequests => {
                if (tradeRequests.length <= 0) {
                  return res.status(404).json({
                    tradeRequests: "No requests found for this product"
                  });
                }
                res.json(tradeRequests);
              });
          })
          .catch(err => console.log(err));
      } else {
        errors.product = "Product not found";
        return res.status(404).json(errors);
      }
    });
  }
);

//@route GET api/tardeRequests/:trade_id/send_message
//@desc  Send message to you business partner about trade request
//@acces Private
router.post(
  ":trade_id/send_message",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);

module.exports = router;
