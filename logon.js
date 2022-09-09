var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  next();
});
// define the home page route
router.get('/', function(req, res) {
  
  if( typeof req.query.error === "undefined") {
    error = "";
  }
  else {
    error = req.query.error;
  }
  res.render('logon', {
    user: "", error: error
  });
});

module.exports = router;