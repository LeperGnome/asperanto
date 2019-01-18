var express = require('express');
var router = express.Router();

/* GET category page. */
router.get('/', function(req, res, next) {
  res.render('category_template');
});

module.exports = router;