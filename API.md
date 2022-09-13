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
- **0** - _Not running_ ( when the activity in workflow end)
- **1** - _running_ ( when the activity in workflow start)
- **2**- _Error_ ( when the activity in workflow end with Errors)

you will find a python utility ( _start_all_task.py_ ) under utility folder that permit to change the status of all workflow with a new status or change a specific status of a task in a workflow.
start the utility in order to have a context help with parameter.
