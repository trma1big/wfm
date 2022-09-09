var jwt = require('jsonwebtoken');
var glob= require('./module'); 
const fs = require('fs'); 
require('dotenv').config()

tokenList = {}



exports.login = function(req, res){
    
    let username = req.body.username.toLowerCase();    
    let password = req.body.password;
    let api = 0;
    if (typeof req.body.api === "string") {
        api = parseInt(req.body.api);
    }else {
        api = req.body.api;
    }
    var checkpwd = "";
    let rawdata = fs.readFileSync(process.env.CONF_FOLDER + '/users.json');
    let users = JSON.parse(rawdata);    
    var __FOUND = users.find(function(post, index) {
        if(post.username == username)
            return true;
    });
    
    if (typeof __FOUND !== 'undefined') {                
        checkpwd = __FOUND.password;       
    }
    
    if (checkpwd === "") {
        if (process.env.AUDIT === "1"){      
            item_ = ' LOGIN UNSUCCESSFUL ' +  username + "\n";
            glob.write_hist(item_);
        }
        if (api !== 1) {
            return res.redirect('/logon?error=1');
        } else {
            const response = {
                "status": "user not found",
                "username" : username
            }
            return res.status(403).json(response);
        }
    }
    
    if (!username || !password || glob.decrypt(checkpwd) !== password){            
        if (process.env.AUDIT === "1"){      
            item_ = ' LOGIN UNSUCCESSFUL ' +  username + "\n";
            glob.write_hist(item_);
        }
        if (api !== 1) {
            return res.redirect('/logon?error=1');
        } else {
            const response = {
                "status": "password not correct",
                "username" : username
            }
            return res.status(403).json(response);
        }

    }

    let payload = {username: username}
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    })

    let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.REFRESH_TOKEN_LIFE
    })

    __FOUND.username.refreshToken = refreshToken
    if (api !== 1 ) {
       
        // res.status(200).json(response);
        session=req.session;
        session.user=username;
        session.isadmin=__FOUND.admin;
        session.jwt=accessToken;
        session.refreshToken=refreshToken;
        //res.cookie("jwt", accessToken, {secure: false, httpOnly: true})
        // res.cookie("user", username)
        // res.cookie("isadmin", __FOUND.admin)
        // res.json(response);        
        if (process.env.AUDIT === "1"){      
            item_ = ' LOGIN SUCCESSFUL ' +  username + "\n";
            glob.write_hist(item_);
          }
        res.redirect("/");
        res.send()
    } else {
        const response = {
            "status": "Logged in",
            "token": accessToken,
            "refreshToken": refreshToken,
            "username" : username
        }
        tokenList[refreshToken] = response;
        if (process.env.AUDIT === "1"){      
            item_ = ' API LOGIN SUCCESSFUL ' +  username + "\n";
            glob.write_hist(item_);
        }
        res.status(200).json(response);
    }
}

exports.refresh = function (req, res){
    let accessToken = req.session.jwt
    let rawdata = fs.readFileSync(process.env.CONF_FOLDER + '/users.json');
    let users = JSON.parse(rawdata);
    if (!accessToken){
        return res.status(403).send()
    }
    let payload_refresh
    try{
        payload_refresh = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
     }
    catch(e){
        return res.status(401).send()
    }

    // let refreshToken = users[payload.username].refreshToken
    let refreshToken = req.session.refreshToken;

    try{
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    }
    catch(e){
        return res.status(401).send()
    }
    delete payload_refresh.exp;
    delete payload_refresh.iat;
    // console.log("paylod" )
    // console.log(payload_refresh)
    // delete req.session.jwt;
    let newToken = jwt.sign(payload_refresh, process.env.ACCESS_TOKEN_SECRET, 
    {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    })

    let newrefreshToken = jwt.sign(payload_refresh, process.env.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.REFRESH_TOKEN_LIFE
    })
    
    session=req.session;
    session.jwt=newToken;
    session.refreshToken = newrefreshToken;
    res.send("halted");
   
}
