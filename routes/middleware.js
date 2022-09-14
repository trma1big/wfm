const jwt = require('jsonwebtoken')




exports.verify = function(req, res, next){

     const accessToken = req.session.jwt || req.body.token || req.query.token || req.headers['x-access-token'];     
    if (!accessToken){        
            res.redirect("/logon");
        return res.status(403).send();
    }
    
    let payload        
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)                   
        next();
    }
    catch(e){   
        console.log("error with verify : " + e);
        res.redirect("/logon");            
        return res.status(403).send()
    }
}
exports.verifyifeditor = function(req, res, next){
    let accessToken = req.session.jwt        
    if (!accessToken || (parseInt(req.session.isadmin) !== 1) &&  (parseInt(req.session.isadmin) !== 3)){   
        // if (process.env.USE_SSO == "0") {    
            res.redirect("/logon");            
        // }
        // else {
        //     res.redirect("/sso/login");
        // }
        return res.status(403).send()
    }
    let payload        
    try{

        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)           
        next()
    }
    catch(e){        
        console.log("error with verify : " + e);
        res.redirect("/logon");            
        return res.status(403).send()
    }
}

exports.verifyifadmin = function(req, res, next){
    let accessToken = req.session.jwt        
    if (!accessToken || parseInt(req.session.isadmin) !== 1){   
        // if (process.env.USE_SSO == "0") {    
            res.redirect("/logon");            
        // }
        // else {
        //     res.redirect("/sso/login");
        // }
        return res.status(403).send()
    }
    let payload        
    try{

        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)           
        next()
    }
    catch(e){        
        console.log("error with verify : " + e);
        res.redirect("/logon");            
        return res.status(403).send()
    }
}

exports.verifyAPI = function(req, res, next){
    var whitelist =
    [
        '192.168.0.246',
        '127.0.0.1'
    ];
    var ip = req.ip 
            || req.connection.remoteAddress 
            || req.socket.remoteAddress 
            || req.connection.socket.remoteAddress;
    
    if(whitelist.indexOf(ip) === -1)
    {
        return res.status(403).send()
    }
    next();
};