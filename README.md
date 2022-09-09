# wfm
WorkFlow Monitor

configure using standard BPMn diagram files a simple workflow that rapresent the process/activity (manual or using programs ) needed to close an operational day.
the status of each fases can be changed using the API or manually using the web interface.

no databases needed, all data are saved on json files in order to be portable without problems.


 # INSTALL
 + install node js 
 + clone the repo
 + _cd wfm_
 + _npm init_
 + rename all _db/.json.distribution_ to _db/.json_
 + rename ._env.distribution_ to _.env_
 + update _.env_ data in order to customize your installation

# WEB INTERFACE
by default the web interface respond on port 80 so please go to http://localhost
the default username is _admin_ with password _password_.


# API
The application expose _APIs_ in order to 

+ _login_ in order to obtain a session token
+ _list_ task in workflow with status
+ _manage the status_ of every single _TASK_ of the workflow 




