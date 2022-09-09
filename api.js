var express = require('express');
const { exit } = require('process');
var router = express.Router();
var glob= require('./module'); 
var jwt_decode = require('jwt-decode');
require('dotenv').config()


router.get('/jobs/:taskname', function(req, res) { 
  if(typeof req.session.user === "undefined" ) {
    var decoded = jwt_decode(req.headers['x-access-token']);
    username = decoded.username;
  } else {
    username = req.session.user;
  }
  rawdata = glob.read_conf(username); 
  if (typeof rawdata !== 'undefined' && rawdata !== 'No file') {
    todelete = [];
    rawdata.conf.tasks.task.forEach(function(item, index, object) {
      if (req.params.taskname !== item.name) {        
        todelete.push(index);
      }            
    });

    todelete.reverse();
    for (const x of todelete) { rawdata.conf.tasks.task.splice(x,1); }    
    if (rawdata.conf.tasks.task.length === 0) { res.send([{"ErrorCode" : 1, type : "Warning", ErrorMessage : "no recors found"}]); }
    else {
      res.send(rawdata.conf.tasks.task);
    }
    
  }
  else {
    res.send([{"ErrorCode" : 0, type : "Abort", ErrorMessage : "Problems retrieving conf data"}]);
  }  
});

router.get('/tasks/:wsname/:taskname', function(req, res) { 
  if(typeof req.session.user === "undefined" ) {
    var decoded = jwt_decode(req.headers['x-access-token']);
    username = decoded.username;
  } else {
    username = req.session.user;
  }
  rawdata = glob.read_conf(username); 
  if (typeof rawdata !== 'undefined' && rawdata !== 'No file') {        
    todelete = [];
    rawdata.conf.tasks.task.forEach(function(item, index, object) {
 
      if ((req.params.wsname !== item.name) || ((req.params.taskname !== item.jobs) && ( "ALL" !== req.params.taskname))) {        
        todelete.push(index);
      }      
    });
    todelete.reverse();
    for (const x of todelete) { rawdata.conf.tasks.task.splice(x,1); }
    
    if (rawdata.conf.tasks.task.length === 0) { res.send([{"ErrorCode" : 1, type : "Warning", ErrorMessage : "no recors found"}]); }
    else {
      
      res.send(rawdata.conf.tasks.task);
    }
    
  }
  else {
    res.send([{"ErrorCode" : 0, type : "Abort", ErrorMessage : "Problems retrieving conf data"}]);
  }
});

router.post('/chg_task_status', function(req, res) { 
  // CURL EXAMPLE x WINDOWS : curl  -X POST -H "Content-Type: application/json" -d "{\"wsname\": \"01-bpo-gg-generic\", \"taskname\": \"ARACCAMBI\", \"status\":0}" http://localhost:8383/api/v1/chg_task_status
  if(typeof req.session.user === "undefined" ) {
    var decoded = jwt_decode(req.headers['x-access-token']);
    username = decoded.username;
  } else {
    username = req.session.user;
  }
  
  rawdata = glob.read_conf(username);  
  if (typeof rawdata !== 'undefined' && rawdata !== 'No file') {            
    if ((typeof req.body.wsname !== 'undefined') && (typeof req.body.taskname !== 'undefined') && (typeof req.body.status !== 'undefined')){
    elab = 0;
    if (typeof req.body.status === "string"){
      status_new = parseInt(req.body.status);
    }
    else {
      status_new = req.body.status;
    }
    let nodeDate = require('date-and-time');
    let current = nodeDate.format(new Date(), 'DD/MM/YYYY HH:mm:ss');    
    rawdata.conf.workflows.workflow.forEach(function(item, index, object) {      
      if (req.body.wsname === item.file) {        
        item.status = status_new;
        if (status_new === 1) {item.lastrun = current;}
        if (status_new === 0) {item.lastend = current;}
        if (status_new === 2) {item.lastend = current;}
      }
    });  
    rawdata.conf.tasks.task.forEach(function(item, index, object) {      
      if ((req.body.wsname === item.name) && ((req.body.taskname === item.jobs))) {
        item.status = status_new;
        if (status_new === 1) {item.last_start = current;}
        if (status_new === 0) {item.last_end = current;}
        if (status_new === 2) {item.last_end = current;}
        elab = 1;
      }      
    });
    if (process.env.AUDIT === "1"){      
      item_ = ' CHANGED STATUS ' + username + " " + req.body.wsname + ' ' + req.body.taskname + " "  +req.body.status + "\n";
      glob.write_hist(item_);
    }
    glob.write_conf(username, rawdata );
    if (elab === 0) { res.send([{"ErrorCode" : 1, type : "Warning", ErrorMessage : "no recors found"}]); }
    else {
      res.send([{ErrorCode : 0, type : "Ok", ErrorMessage : "status changed"}]);
    }
   }    
   else {
    res.send([{ErrorCode : 3, type : "Error", ErrorMessage : "not all parameter sent"}]);
   }
  }
  else {
    res.send([{ErrorCode : 999, type : "Abort", ErrorMessage : "Problems retrieving conf data"}]);
  }
});

function get_task_status (rawdata, task, username){
  starting_status = 0;
  rawdata.conf.tasks.task.forEach(function(item_, index, object) {             
    if (item_.name === task) {
      if (item_.status === 1 && starting_status !== 2) { starting_status = 1}
      if (item_.status === 2 ) { starting_status = 2}
    }
  });
  return  starting_status;  
}

router.get('/list/:type', function(req, res) {
  if(typeof req.session.user === "undefined" ) {
    var decoded = jwt_decode(req.headers['x-access-token']);
    username = decoded.username;
  } else {
    username = req.session.user;
  }
  rawdata = glob.read_conf(username);  
  switch (req.params.type) {
    case "entities":
      if (typeof rawdata !== 'undefined' && rawdata !== 'No file') {    
        res.send(rawdata.conf.entities.entity);
      }
      else {
        res.send([]);
      }
    break;
    case "workflows":    
      if (typeof rawdata !== 'undefined' && rawdata !== 'No file') {        
        rawdata.conf.workflows.workflow.forEach(function(item2, index, object) {     
          rawdata.conf.workflows.workflow[index].status = get_task_status(rawdata, item2.file, username);          
        });
        
        res.send(rawdata.conf.workflows.workflow);
      }
      else {
        res.send([]);
      }
    break;
    case "tasks":
      if (typeof rawdata !== 'undefined' && rawdata !== 'No file') {        
        oldname= "DEFAULT";
        overallstatus=0;
        todelete = [];
        rawdata.conf.tasks.task.forEach(function(item, index, object) {
          
          if (oldname === item.name) {

            todelete.push(index);
          } else {            
            oldname = item.name;
            rawdata.conf.tasks.task[index].status = get_task_status(rawdata, item.name, username);
          }          
        });
        todelete.reverse();
        for (const x of todelete) { rawdata.conf.tasks.task.splice(x,1); }
        
        res.send(rawdata.conf.tasks.task);
      }
      else {
        res.send([]);
      }
    break;    
  }
});

module.exports = router;