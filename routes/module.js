const { stringify } = require('querystring');
require('dotenv').config()
const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; 
require('dotenv').config()
const key = Buffer.from(process.env.key_crypt, 'hex');
const iv = Buffer.from(process.env.iv_crypt, 'hex');




//Encrypting text
function encrypt(text) {
   let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypting text
function decrypt(text) {
  
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function read_conf(user) {
  
  // var xml2js = require('xml2js');
  const fs = require('fs');   
  var json_ = ""
  try {
    json_ = fs.readFileSync(process.env.CONF_FOLDER + '/wfm.json');
  } catch (err) {
    console.log("no such file....");
  }
  if (json_ == "") {return "No file"; }
  var rawdata = "No file";    
  // var parser = new xml2js.Parser();
  rawdata = JSON.parse(json_);
  // parser.parseString(xml, function(err,result){    
  //   rawdata = result;
  // });
  role = getRoleByUser(user);
  todelete = [];
  
  // if (role !== "ALL") {
    rawdata.conf.workflows.workflow.forEach(function(item, index, object) {   
      if ("DEFAULT" !== item.name) {        
        if ((role !== item.entity) && (role !== "ALL")) {
          todelete.push(index);
          rawdata.conf.workflows.workflow[index].visible = 0;} else {rawdata.conf.workflows.workflow[index].visible = 1;
          } 
      }
    }
    );  
    todelete.reverse();
    for (const x of todelete) { rawdata.conf.workflows.workflow.splice(x,1); }  
    // for (const x of todelete) { rawdata.conf.workflows.workflow[x].visible = 0; }

    return rawdata;
  // } else {    
  //   return rawdata;
  // }
};

function getRoleByUser(user) {
  const fs = require('fs'); 
  let rawdata = fs.readFileSync(process.env.CONF_FOLDER + '/users.json');

  let users = JSON.parse(rawdata);
  var newArray = users.filter(function (el) {
    return el.username === user;
  });

  return newArray[0].entity;
};

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


function getDateStringCustom(oDate) {
  var sDate;
  if (oDate instanceof Date) {
      sDate = oDate.getYear() + 1900
          + '-'
          + ((oDate.getMonth() + 1 < 10) ? '0' + (oDate.getMonth() + 1) : oDate.getMonth() + 1)
          + '-' + oDate.getDate()
          + ' ' + oDate.getHours()
          + ':' + ((oDate.getMinutes() < 10) ? '0' + (oDate.getMinutes()) : oDate.getMinutes())
          + ':' + ((oDate.getSeconds() < 10) ? '0' + (oDate.getSeconds()) : oDate.getSeconds());
  } else {
      throw new Error("oDate is not an instance of Date");
  }
  return sDate;
}

function write_stats(username, current,wsname,taskname,status) {
  var json_stats = ""
  const fs = require('fs');
  // fs.createWriteStream(process.env.CONF_FOLDER + '/wfm_stats.db', { overwrite: false }); 
  fs.appendFile(process.env.CONF_FOLDER + '/wfm_stats.db', current + ";" + username + ";" + wsname + ";"+ taskname + ";" + status + "\n", (err) => {
    if (err) {
        throw err;
    }
  });  
}

function in_interval (curdate, status, start_date,end_date) {
  var moment = require('moment');
  var cd_ = moment(curdate, "DD/MM/YYYY"); // 1st argument - string, 2nd argument - format
  var cd= cd_.toDate();
  var sd_ = moment(start_date, "DD/MM/YYYY"); // 1st argument - string, 2nd argument - format
  var sd= sd_.toDate();
  var ed_ = moment(end_date, "DD/MM/YYYY"); // 1st argument - string, 2nd argument - format
  var ed= ed_.toDate();
  if (status === "1") {
      if (( cd >= sd) && (cd <= ed)) { return true}
  }
  else {
    return false
  }
}

function getduration( d_start_date, d_end_date) {
  var moment = require('moment');
  var sd_ = moment(d_start_date, "DD/MM/YYYY hh:mm:ss"); // 1st argument - string, 2nd argument - format
  // var sd= sd_.toDate();
  var ed_ = moment(d_end_date, "DD/MM/YYYY hh:mm:ss"); // 1st argument - string, 2nd argument - format
  // var ed= ed_.toDate();
  return ed_.diff(sd_, 'minutes')
}

async function getendtask(e_start_date_,wsname_,taskname_){
  const fs = require('fs');   
  const readline = require('readline');
  const fileStream_ = fs.createReadStream(process.env.CONF_FOLDER + '/wfm_stats.db');
  const rl_ = readline.createInterface({
    input: fileStream_,
    crlfDelay: Infinity
  });
  var ret_date = ""
  var moment = require('moment');
  var sd__ = moment(e_start_date_, "DD/MM/YYYY hh:mm:ss"); // 1st argument - string, 2nd argument - format
  var sd_= sd__.toDate();
  for await (const line_ of rl_) {
    var l_ = line_.split(";");    
    var cur__ = moment(l_[0], "DD/MM/YYYY hh:mm:ss"); // 1st argument - string, 2nd argument - format
    var cur_= cur__.toDate();
    if ( cur_ >= sd_) {
      
      if (l_[4] !== "1") {
        
        if ((wsname_ === l_[2]) && (taskname_ === l_[3])) {     
          
          return l_[0]
        }
      }
    }
  }
  return ""
}



async function read_stats(start_date,end_date,wsname,taskname) {  
  
  const fs = require('fs');   
  const readline = require('readline');
  const fileStream = fs.createReadStream(process.env.CONF_FOLDER + '/wfm_stats.db');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  var _j = []
  for await (const line of rl) {
    var l = line.split(";");
    if (in_interval (l[0],l[4],start_date,end_date)) {
      if ((wsname !== "") && (taskname !== "")) {
        if (l[2] === wsname) { 
          if (l[3] === taskname) { 
            var et = await getendtask(l[0],wsname,taskname)            
            var hh = getduration(l[0],et);
            // console.log("start_date:" + l[0] + " end_date:" + et + " duration:" + hh);
            var item = {"wsname" : wsname, "taskname": taskname, "start_date" : l[0], "end_date" : et, "duration": hh}
            _j.push(item)
            // console.log(l)
          } 
        } 
      }
    }
  }
  return JSON.stringify(_j);
}

function write_hist(item) {
  const fs = require('fs');
  var date = new Date();
  current = getDateStringCustom(date);
  fs.appendFile(process.env.PATHLOG + '/wfm_audit.log', current + " " + item , (err) => {
    if (err) {
        throw err;
    }
  });
}

function write_conf(user, rawdata) {
  if (rawdata !== "" ) {
    // var xml2js = require('xml2js');
    const fs = require('fs'); 
    // var builder = new xml2js.Builder();
    
    if (!fs.existsSync(process.env.CONF_FOLDER)){
      fs.mkdirSync(process.env.CONF_FOLDER);
    }
    // console.log(user);
    role = getRoleByUser(user);
    if (role !== "ALL") {
      old = read_conf("admin");
      rawdata.conf.workflows.workflow = [];
      old.conf.workflows.workflow.forEach(function(item, index, object) {        
        rawdata.conf.workflows.workflow.push(item);
      });      
    }
    
    // var xmlback = builder.buildObject(rawdata);
    fs.writeFile(process.env.CONF_FOLDER + '/wfm.json', JSON.stringify(rawdata), (err) => {
      if (err) {
          throw err;
      }
    });

    // fs.writeFile(process.env.CONF_FOLDER + '/wfm.xml', xmlback, (err) => {if (err) {throw err;}});     
  }
};

function remore_files_after_upload (user) {
  const fs = require('fs'); 
  fs.readdirSync("upload/").map(fileName => {
    if (fileName.includes('_diff')) {
        if (fileName.includes(user)) {
          fs.unlinkSync("upload/" + fileName);
        }
    }
  });
}


module.exports = {
  encrypt,
  decrypt,
  write_hist,
  write_stats,
  read_conf,
  write_conf,
  remore_files_after_upload,
  read_stats  
}