
# wfm
## WorkFlow Monitor

configure WF using standard BPMn diagram files - in this case a simple BPM workflow that represent a list of process/activity  - 
typical use case are :
* a workflow that contains all the backoffice process needed to "close" a day ( _example/example_BPO.bpmn )
* a workflow that contains all the AM IT department process needed to give the start to the customers to work on an application ( _example/example_IT.bpmn )

the status of each fases rappresented in bpmn diagram could be changed using the API or manually using the web interface.

no databases needed!! all configuration are saved on json files in order to be portable without problems.

 # INSTALL
 go to [INSTALL WIKI](https://github.com/trma1big/wfm/wiki/Install)

# WEB UI
go to [WEBUI WIKI](https://github.com/trma1big/wfm/wiki/WEBUI)

# API
The application expose _APIs_ in order to: 

+ _login_ in order to obtain a session token -> _http://localhost/login_ 
    - METHOD : POST 
    - DATA : username, password and the api = 1
    - RETURN FORMAT : json
    - RETURN : session token
+ _list_ workflow file with status -> http://localhost/api/v1/list/tasks 
    - METHOD : GET 
    - AUTH : 'X-Access-Token' on header ( token get from login call)
    - RETURN FORMAT : json
    - RETURN : name, file, status
+ _list_  tasks in a workflow with status -> http://localhost/api/v1/jobs/{WORKFLOW NAME}
    - METHOD : GET 
    - AUTH : 'X-Access-Token' on header ( token get from login call)
    - RETURN FORMAT : json
    - RETURN : name, file, jobs_id, jobs, jobs_description, status, last_start, last_end
+ _manage the status_ of every single _TASK_ of the workflow -> http://localhost/api/v1/chg_task_status
    - METHOD : POST
    - AUTH : 'X-Access-Token' on header ( token get from login call)
    - DATA FORMAT : json
    - DATA : "wsname" ( workflow name), "taskname" ( jobs returned by previous API )  "status" ( new status value )


possible status value are:
- 0 - Not running ( when the activity in workflow end)
- 1 - running ( when the activity in workflow start)
- 2 - Error ( when the activity in workflow end with Errors)

you will find a python utility ( _start_all_task.py_ ) under utility folder that permit to change the status of all workflow with a new status or change a specific status of a task in a workflow.
start the utility in order to have a context help with parameter.
