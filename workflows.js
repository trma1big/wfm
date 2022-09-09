var express = require('express');
const { exit } = require('process');
var router = express.Router();
var glob= require('./module'); 
const {verify,verifyifadmin,verifyAPI} = require('./middleware')

router.get('/', function(req, res) {
  res.render('workflows', {
     user: req.session.user, isadmin: req.session.isadmin
  });

});



router.post('/create', verifyifadmin,function(req, res) { 
    rawdata = glob.read_conf(req.session.user);
    item = {};
    item = {'name': req.body.name,
      'description': req.body.description,
      'status':  req.body.status,
      'lastrun' : req.body.lastrun,
      'lastend' : req.body.lastend,
      'file' : req.body.file,
      'entity' : req.body.entity
    };
   
    if (typeof req.body.id !== 'undefined' && req.body.id !== '' ) { 
      id = parseInt(req.body.id);
      rawdata.conf.workflows.workflow.splice(id,1,item);
      
    }
    else {    
      rawdata.conf.workflows.workflow.push(item);

    }
    
    glob.write_conf(req.session.user, rawdata);
  res.redirect('/workflows');
  res.end();  
});

router.get('/edit/:id', verifyifadmin,function(req, res, next) {
  rawdata = glob.read_conf(req.session.user);
  jobj = rawdata.conf.workflows.workflow[parseInt(req.params.id)];
  
  res.render('workflow_edit_tabbed', { user: req.session.user, isadmin: req.session.isadmin, title: 'Post Details', postDetail: jobj, id: req.params.id });
});


router.delete('/delete/:id', verifyifadmin,function(req, res) {  
  id = parseInt(req.params.id);
  if (id !== 0) {
    rawdata = glob.read_conf(req.session.user);
    rawdata.conf.workflows.workflow.splice(req.params.id,1)  
    glob.write_conf(req.session.user, rawdata);
  }
  res.sendStatus(201);  
});


router.get('/create', verifyifadmin,function(req, res) {
  res.render('workflow_edit_tabbed', {
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