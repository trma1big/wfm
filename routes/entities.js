var express = require('express');
const { exit } = require('process');
var router = express.Router();
var glob= require('./module'); 
const {verify,verifyifadmin,verifyAPI} = require('./middleware')

router.get('/', function(req, res) {
  res.render('entities', {
     user: req.session.user, isadmin: req.session.isadmin
  });

});



router.post('/create', verifyifadmin,function(req, res) { 

    rawdata = glob.read_conf(req.session.user);    

    
    item = {};
    item = {'name': req.body.name,
      'description': req.body.description
    };

    if (typeof req.body.id !== 'undefined' && req.body.id !== '' ) { 
          rawdata.conf.entities.entity.splice(parseInt(req.body.id),1,item);
    }
    else {    
      rawdata.conf.entities.entity.push(item);
    }
    
    glob.write_conf(req.session.user, rawdata);
  res.redirect('/entities');
  res.end();  
});

router.get('/edit/:id', verifyifadmin,function(req, res, next) {
  rawdata = glob.read_conf(req.session.user);
  
  jobj = rawdata.conf.entities.entity[parseInt(req.params.id)];
  
  res.render('entities_edit_tabbed', { user: req.session.user, isadmin: req.session.isadmin, title: 'Post Details', postDetail: jobj, id: req.params.id});
});


router.delete('/delete/:id', verifyifadmin,function(req, res) {  
  if (req.params.id !== "0") {
    rawdata = glob.read_conf(req.session.user);
    tomodify = [];
    name_da_cancellare = rawdata.conf.entities.entity[req.params.id].name;
    rawdata.conf.workflows.workflow.forEach(function(item, index, object) {      
      if (name_da_cancellare === item.entity) {

        tomodify.push(index);
      }
    });
    
    for (const x of tomodify) { 
      rawdata.conf.workflows.workflow[x].entity = ""; 
    }    
    rawdata.conf.entities.entity.splice(req.params.id,1)

    glob.write_conf(req.session.user, rawdata);
  }
  res.sendStatus(201);  
});


router.get('/create', verifyifadmin,function(req, res) {

  res.render('entities_edit_tabbed', {
    user: req.session.user, isadmin: req.session.isadmin, id: ""
  });  
});


String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}





router.get('/copy_file/:name', verifyifadmin, function(req, res) {
  glob.remore_files_after_upload(req.session.user);
  const fs = require('fs');
    var oldpath = process.env.CONF_FOLDER + req.params.name;
    var newpath = 'upload/' + req.session.user + '_conf.xml';
    if (!fs.existsSync('upload/')){
      fs.mkdirSync('upload/');
    }
    fs.copyFile(oldpath, newpath, function (err) {
      if (err) throw err;
      res.sendStatus(201);
      return;
    });
});

module.exports = router;