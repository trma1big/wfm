# INSTALL
## Install steps
 + install node js ( https://nodejs.org/it/download/ )
 + clone the repo ( _git clone https://github.com/trma1big/wfm.git_ )
 + _cd wfm_
 + _npm install_
 + _node install.js_
 + update _.env_ data in order to customize your installation (don't remove _key_crypt_ and _iv_crypt_ just created by _install.js_)
 + execute _node app.js_

## Base configuration _.env_ file
### values changed during install
during the _node install.js_ process the .env conf file is changed with the random key and iv values in order to update _admin_ user password.<br>
this values are saved in 2 variable and are used in the application to encrypt new user password or decrypt the existing during the logon process.<br>
_key_crypt_ = ************************************************************<br>
_iv_crypt_ = *******************************<br>
### JWT token
you have/could change with an editor some value on .env in order to manage and secure the app.<br>



ACCESS_TOKEN_SECRET=HERE THE TOKEN SECRET (_you have to change it with a sequence of chars_)<br>
ACCESS_TOKEN_LIFE=30m (_token lifetime_)<br>
REFRESH_TOKEN_SECRET=HERE THE TOKEN REFRESH SECRET (_you have to change it with a sequence of chars_)<br>
REFRESH_TOKEN_LIFE=2h (_refresh token lifetime_)<br>

### Server startup
USE_SSL=0 (_use or not SSL, 0 not enabled_)<br>
CERT= (_cert path to be used if you want to start https site_)<br>
KEY= ( _cert key path to be used if you want to start https site_)<br>
PORT = 80 (_change to the port value you wants use_ )<br>
HOST = 0.0.0.0 (_0.0.0.0 means all ip configured_)<br>

### App path customization
CONF_FOLDER=./db (_where to save database information - users and workflows json-_ )<br>
WF_FOLDER=./wf ( _where to upload BPMn files_)<br>
PATHLOG=./log ( _where to save app log and audit log if enabled_  )<br>

### Audit LOG
enable or disable Audit log in order to track changes on configurations and status changes.<br>
AUDIT=0 (_0 disabled 1 Enabled_)<br>