var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
const validator = require('@authenio/samlify-node-xmllint');
const saml = require('samlify');
const binding = saml.Constants.namespace.binding;
saml.setSchemaValidator(validator);

const fs = require('fs');



const IdentityProvider = saml.IdentityProvider;

var settings = {
	privateKey: fs.readFileSync('certificates/encryptKey.pem'),
	privateKeyPass: '',
	metadata: fs.readFileSync('certificates/sp-metadata.xml'),
	encPrivateKey: fs.readFileSync('certificates/encryptKey.pem'),
	encPrivateKeyPass: '',
	requestSignatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512',
	authnRequestsSigned: true,
	wantAssertionsSigned: true,
	wantMessageSigned: true,
	wantLogoutResponseSigned: true,
	wantLogoutRequestSigned: true,
	assertionConsumerService: [{
		Binding: binding.post,
		Location: 'http://localhost:8080/sso/acs',
	}]
	};
var sp = saml.ServiceProvider(settings);
const idp = IdentityProvider({
  metadata: fs.readFileSync('certificates/idp-metadata.xml'),
  wantLogoutRequestSigned: true
});

// Release the metadata publicly
router.get('/metadata', (req, res) => res.header('Content-Type','text/xml').send(sp.getMetadata()));

// Access URL for implementing SP-init SSO
router.get('/login', (req, res) => {
    const { id, context } = sp.createLoginRequest(idp, 'redirect');
    return res.redirect(context);
});

router.post('/acs', (req, res) => {
   sp.parseLoginResponse(idp, 'post', req)
  .then(parseResult => {
	  	var isadmin = 0;
		var email =  parseResult.extract.attributes["urn:oid:0.9.2342.19200300.100.1.3"];
        var user = parseResult.extract.attributes["urn:oid:2.5.4.42"];
        group_array = parseResult.extract.attributes["urn:oid:1.3.6.1.4.1.5923.1.5.1.1"];
		if (typeof group_array !== "undefined") {
        	if (group_array.includes("CN=*,OU=*,OU=*,OU=*,DC=*,DC=*")) { isadmin = 1 } 
		}
		let payload = {username: user}
		let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
			algorithm: "HS256",
			expiresIn: process.env.ACCESS_TOKEN_LIFE
		})    	
    	res.cookie("jwt", accessToken, {secure: false, httpOnly: true})
		res.cookie("user", user + "(" + email + ")")
    	res.cookie("isadmin", isadmin);
    	res.redirect("/jobs");
		res.send();

    })
  .catch(console.error);
});

module.exports = router;
