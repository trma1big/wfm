@echo off
@REM npm init
@REM copy .env.ditrubution .env
@REM copy db/wfm.json.distribution db/wfm.json
@REM copy db/user.json.distribution db/user.json


set /p KeyCrypt=Insert key crypt (example : 2e8224a7ba5c5a67ca6e018bec55f3936aa11469667142e0deb4c2604e646d90):
echo %KeyCrypt%

set /p iv_crypt=Insert iv crypt (example : 95b243eac24577b79eeec50dd1427660):
echo %IVCrypt%

set /p ADMINPWD=Insert key crypt (example : 2e8224a7ba5c5a67ca6e018bec55f3936aa11469667142e0deb4c2604e646d90):
echo %ADMINPWD%

@REM node install.js