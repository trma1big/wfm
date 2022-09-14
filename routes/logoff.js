var express = require('express');
var router = express.Router();


router.use(function timeLog(req, res, next) {
  next();
});


router.get('/', function(req, res) {  
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;