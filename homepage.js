var express = require('express');
var router = express.Router();

// middleware that is specific to this router

// define the home page route
router.get('/', function(req, res) { 
  if (req.session.jwt !== "") {
    res.render('index',{
      user: req.session.user, isadmin: req.session.isadmin, sso: process.env.USE_SSO
    });    
  }
  else {
  res.render('logon',{
    user: req.session.user, isadmin: req.session.isadmin, sso: process.env.USE_SSO
  });  
  }
});


module.exports = router;