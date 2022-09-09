const jwt = require('jsonwebtoken')

exports.refresh = function (req, res){

    let accessToken = req.session.jwt

    if (!accessToken){
        return res.status(403).send()
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
     }
    catch(e){
        return res.status(401).send()
    }

    //retrieve the refresh token from the users array
    console.log(req.session);
    let refreshToken = req.session.refreshToken;
    // let refreshToken = users[payload.username].refreshToken

    //verify the refresh token
    try{
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    }
    catch(e){
        return res.status(401).send()
    }

    let newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, 
    {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    })
    res.session.jwt = newToken;
    // res.cookie("jwt", newToken, {secure: true, httpOnly: true})
    res.send()
}