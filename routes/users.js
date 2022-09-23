var express = require('express');
const { exit } = require('process');
var router = express.Router();
const crypto = require('crypto')
var glob= require('./module'); 
require('dotenv').config()

router.get('/', function(req, res) {
  const fs = require('fs'); 
  let rawdata = fs.readFileSync(process.env.CONF_FOLDER + '/users.json');
  let users = JSON.parse(rawdata);
  res.render('users', {
     users: users, user: req.session.user, isadmin: req.session.isadmin
  });

});

router.get('/list', function(req, res) {
  const fs = require('fs'); 
  let rawdata = fs.readFileSync(process.env.CONF_FOLDER + '/users.json');
  let users = JSON.parse(rawdata);
  res.send(users);
});

router.get('/create', function(req, res) {
  res.render('user_edit', {
    user: req.session.user, isadmin: req.session.isadmin
  });  
});

router.post('/create', function(req, res) {    
  const fs = require('fs'); 
  let rawdata = fs.readFileSync(process.env.CONF_FOLDER + '/users.json');
  let users = JSON.parse(rawdata);
  
  if (typeof req.body.id !== 'undefined' && req.body.id !== '') {     
    users.splice(parseInt(req.body.id),1)
  }
  if (typeof req.body.admin == 'undefined') { req.body.admin = 0; }
  if (req.body.entity == '') { req.body.entity= "ALL"; }
  let password = glob.encrypt(req.body.password);
  
  item = {};
  item = {'username': req.body.username.toLowerCase(),
          'password':password,
          'entity':req.body.entity ,
          'admin': parseInt(req.body.admin)
  };
  
  users.push(item);
  const data = JSON.stringify(users);

  fs.writeFile(process.env.CONF_FOLDER + '/users.json', data, (err) => {
      if (err) {
          throw err;
      }

  });
  res.redirect('/users');
  res.end();  
});

router.get('/edit/:id', function(req, res, next) {
  const fs = require('fs'); 
  let rawdata = fs.readFileSync(process.env.CONF_FOLDER + '/users.json');
  let users = JSON.parse(rawdata);
  
  jobj = users[parseInt(req.params.id)];  
  jobj.password = glob.decrypt(jobj.password);
  
  res.render('user_edit', { user : req.session.user, isadmin: req.session.isadmin,title: 'Post Details', postDetail: jobj, id: req.params.id });
});

router.delete('/delete/:id', function(req, res) { 
  const fs = require('fs'); 
  let rawdata = fs.readFileSync(process.env.CONF_FOLDER + '/users.json');
  let users = JSON.parse(rawdata);

  users.splice(parseInt(req.params.id),1);
  const data = JSON.stringify(users);

  fs.writeFile(process.env.CONF_FOLDER + '/users.json', data, (err) => {
      if (err) {
          throw err;
      }
  
  });
  
  res.sendStatus(201);

});

module.exports = router;