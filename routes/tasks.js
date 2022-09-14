var express = require('express');
const { exit } = require('process');
var router = express.Router();
var glob= require('./module'); 
require('dotenv').config()
const {verify,verifyifadmin,verifyifeditor,verifyAPI} = require('./middleware')

router.get('/', verifyifeditor,function(req, res) {
  
  res.render('tasks', {
     user: req.session.user, isadmin: req.session.isadmin
  });

});

router.get('/create_task', verifyifeditor,function(req, res) {
  res.render('create_task', {
     user: req.session.user, isadmin: req.session.isadmin
  });

});

router.delete('/delete/:id', verifyifeditor,function(req, res) {  
  if (req.params.id !== "0") {
    rawdata = glob.read_conf(req.session.user);
    name_da_cancellare = req.params.id;
    
    
     todelete = [];
     rawdata.conf.tasks.task.forEach(function(item, index, object) {
       if (name_da_cancellare === item.name) {            
         todelete.push(index);
       }    
     });
    
    todelete.reverse();
    for (const x of todelete) { rawdata.conf.tasks.task.splice(x,1); }
    tomodify = [];
    rawdata.conf.workflows.workflow.forEach(function(item, index, object) {      
      if (name_da_cancellare === item.file) {
        tomodify.push(index);
      }
    });
    
    for (const x of tomodify) { 
      rawdata.conf.workflows.workflow[x].file = ""; 
      rawdata.conf.workflows.workflow[x].lastrun = ""; 
      rawdata.conf.workflows.workflow[x].lastend = ""; 
    }    
    glob.write_conf(req.session.user, rawdata);
    const fs = require('fs');
    fs.unlinkSync(process.env.WF_FOLDER + "/" + name_da_cancellare + ".bpmn");
  }
  res.sendStatus(201);  
});

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

router.get('/modify_tasks/:where/:id', function(req, res, next) {
  if (req.params.where === "ws") { url = "/workflows"} else { url = "/tasks"}
  filename = '/wf/' + req.params.id;
  res.render('tasks_check_task', { user: req.session.user,  isadmin: req.session.isadmin, title: 'Post Details',  filename: filename, url: url});
});


router.get('/viewtask/:where/:id', function(req, res, next) {
  if (req.params.where === "ws") { url = "/workflows"} else { url = "/tasks"}
  res.render('workflow_view_task', { user: req.session.user,  isadmin: req.session.isadmin, title: 'Post Details',  id: req.params.id, url: url});
});

router.get('/edit/:wf/:job', function(req, res, next) {
  rawdata = glob.read_conf(req.session.user);
  rawdata.conf.tasks.task.forEach(function(item, index, object) {
    if ((req.params.wf !== item.name) || (req.params.job !== item.jobs)) {
      todelete.push(index);
    } else {
      id_record = index;
    }
  });
 
 todelete.reverse();
 for (const x of todelete) { rawdata.conf.tasks.task.splice(x,1); } 
  res.render('tasks_edit_status', {  wf: req.params.wf, job: req.params.job, id : id_record,postDetail: rawdata, user: req.session.user,  isadmin: req.session.isadmin, title: 'Post Details'});
});


router.get('/upload_task', verifyifeditor,function(req, res, next) {
  rawdata = glob.read_conf(req.session.user);
  exists = req.query.exists;  
  res.render('workflow_upload_task', { user: req.session.user,  isadmin: req.session.isadmin, exists: exists});
});

router.post('/save_and_check_tasks', verifyifeditor, function(req, res) {
  filename = req.body.filepond;  
  len = filename.split("\\");
  filename = '/wf/' + len[len.length - 2] + "/" + len[len.length - 1];  
  res.render('workflow_check_task', { user: req.session.user,  isadmin: req.session.isadmin, filename: filename });  
});

router.post('/save_tasks_final', verifyifeditor,function(req, res) {
  
  const fs = require('fs');
  filename = req.body.file.split('/');    
  if (filename.length === 4) {
    fname = filename[3].replace(".bpmn", "");  
    fname_ext = filename[3];
    newpath = process.env.WF_FOLDER + '\\' + filename[3];
  }else {
    fname = filename[2].replace(".bpmn", "");  
    fname_ext = filename[2];
    newpath = process.env.WF_FOLDER + '\\' + filename[2];
  }
  if (req.body.modify !== "1") {
    fs.copyFile(process.env.WF_FOLDER + "/" + filename[2] + "/" + filename[3], newpath, function (err) {        
          // fs.unlinkSync(req.body.file);
    });
    fs.rm(filename[1] + "/" + filename[2], {force: true, recursive: true}, function(err) {      
      if (err) console.error(err) 
    })
  } else {
    fs.writeFile(newpath, req.body.xml_content, (err) => {if (err) {throw err;}});    
  }


  rawdata = glob.read_conf(req.session.user);    
  
  for (let i = 0; i < req.body.jobs.length; i++) {    
    item = {};
    item = {
     'name': fname,
     'file': fname_ext,
     'jobs_id':  req.body.ids[i],
     'jobs':  req.body.jobs[i],
     'jobs_description' : req.body.jobs_desc[i],
     'status' : "",
     'last_start' : "",
     'last_end' : ""
   };
   
   rawdata.conf.tasks.task.push(item); 
   
  }
  
    
  glob.write_conf(req.session.user, rawdata );
  res.redirect('/tasks');
  res.end();  
 
});
router.post('/upload', verifyifeditor,function(req, res) {
  
  const formidable = require('formidable');
  const form =  formidable({ multiples: false });
  
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    const fs = require('fs');
    str = JSON.stringify(files, null, 4);

    rand = makeid(5);
    if (!fs.existsSync(process.env.WF_FOLDER + '\\' + rand + "\\")){
          fs.mkdirSync(process.env.WF_FOLDER + '\\' + rand + "\\");
    }
    if(files.filepond.originalFilename.endsWith(".bpmn")){ filename = files.filepond.originalFilename;}else { filename = files.filepond.originalFilename + ".bpmn"}
    var newpath = process.env.WF_FOLDER + '\\' + rand + "\\" + filename;
    fs.copyFile(files.filepond.filepath, newpath, function (err) {
          if (err) 
          fs.unlinkSync(oldpath);
          filename = files.filepond.originalFilename;

    });
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(newpath);

  });  

});


module.exports = router;