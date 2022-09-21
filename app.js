'use strict';
require('dotenv').config()
var https = require('https')
const express = require('express');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const app = express();
const {login, refresh} = require('./routes/authentication')
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const sessions = require('express-session');
const jwt = require('jsonwebtoken')

const fs = require("fs");
var router = express.Router();
var nodeDate = require('date-and-time');



exports.nodeDate = nodeDate;
if (process.env.USE_SSL === "1") {
  var options = {
    key: fs.readFileSync(process.env.KEY),
    cert: fs.readFileSync(process.env.CERT),
  };
}

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use(cookieParser())


const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: process.env.iv_crypt,
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

const {verify,verifyifadmin,verifyAPI} = require('./routes/middleware')

app.set('view engine', 'ejs');
app.use(cors());
app.use(logger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :user', {
  stream: fs.createWriteStream(process.env.PATHLOG + '/access.log', {flags: 'a'})
}));


var logonform = require('./routes/logon');
var logoff = require('./routes/logoff');
router.post('/login', login);
router.use('/logoff', logoff);
router.use('/logon', logonform);
// Route for SSO with saml2
if ( process.env.USE_SSO === "1") {
  var sso = require('./sso');
  router.use('/sso', sso);
}

var apiaccess = require('./routes/api');
var wfview = require('./routes/workflows');
var userview = require('./routes/users');
var homepageview = require('./routes/homepage');
var tasksview = require('./routes/tasks');
var entityview = require('./routes/entities');

router.get('/download', verifyifadmin,function(req, res){
    const file = __dirname + '/db/wfm.json';
    res.download(file); 
  });
  
router.get('/check_expired_jwt',function(req, res){
  let accessToken = req.session.jwt
    if (!accessToken){
        return res.sendStatus(403);
    }
    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
     }
    catch(e){
        return res.sendStatus(401)
    }
  
  res.send({exp : payload.exp});
}); 

router.get('/download/:file', verifyifadmin, function(req, res){
  const file = __dirname + '/db/' + req.params.file;  
  res.download(file); 
});
router.use('/api/v1', verify, apiaccess)
router.post('/refresh', refresh)
// router.use('/jobs', verify, jobsview)
router.use('/workflows', verify, wfview)
router.use('/users', verifyifadmin, userview)
router.use('/entities', verifyifadmin, entityview)

router.use('/tasks', verify, tasksview)
router.use('/',  verify, homepageview);

const nm_dependencies = ['filepond','filepond-plugin-file-rename','date-and-time','bpmn-js','bootstrap-icons','bootstrap','jquery','@popperjs','datatables.net-bs5','datatables.net','chart.js']; 
nm_dependencies.forEach(dep => {
  app.use(`/${dep}`, express.static(path.resolve(`node_modules/${dep}`)));
});

app.use('/', router);
app.use('/public', express.static(__dirname + '/resources'));

// app.use('/wf', verify, express.static(__dirname + '/wf'));

app.use('/wf', verify, express.static(process.env.WF_FOLDER));

app.use(function(req, res, next){
  res.status(404).render('error_handler', {title: "Sorry, page not found",user: req.session.user,  isadmin: req.session.isadmin});
});

logger.token('user', function(req, res, param) {
  if (typeof req.session !== "undefined") {
  return req.session.user;} else { return ""} 
});

module.exports = router;
if (process.env.USE_SSL == "0") {
  app.listen(parseInt(process.env.PORT), process.env.HOST);
  console.log(`Running on http://${process.env.HOST}:${process.env.PORT}`);
}
else {
  var server = https.createServer(options, app).listen(parseInt(process.env.PORT), process.env.HOST);
  console.log(`Running on https://${process.env.HOST}:${process.env.PORT}`);
}


