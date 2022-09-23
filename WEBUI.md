## WEB UI
by default the web interface respond on port 80 ( view .env PORT = 80 HOST = 0.0.0.0 ).
go to http://localhost.

### MAIN function
* Workflows management : create workflows with task assigned and visibility roles - _entity_ - and display overall status of an entire workflows
* task management : import BPN diagram (you will find in _example_ folder some bpmn diagram that you can use as starting point) and convert information as tasks and description and display overall status of an entire list of tasks part of workflow
* tasks status information : view status of every single task in a workflows and for special role change it
* Online BPMn diagram editor

### workflow.
CRUD interface to manage workflows
**List**
![image](https://user-images.githubusercontent.com/44255116/189895835-ed923274-0ec6-4853-be83-cca2a64c2ac3.png)
**Edit**
![image](https://user-images.githubusercontent.com/44255116/189896656-a3506ac3-801d-42f8-9256-d6b9f41192df.png)

### tasks
CRUD interface to manage Tasks
the Create function permit to upload a BPMn diagram files, create from the uploaded diagram the list of tasks.
**upload**
![image](https://user-images.githubusercontent.com/44255116/189896828-c9548e08-5302-4a09-8c08-417496665fa5.png)
**created tasks list**
![image](https://user-images.githubusercontent.com/44255116/189896992-523bb3d2-f7aa-4f77-a217-7894fb62b788.png)

the Edit function permit to edit the BPMn diagram files and recreate from the changed diagram the list of tasks

the View BPM function permit to view the status of every task
![image](https://user-images.githubusercontent.com/44255116/189321073-8f1eaa5f-2b19-46a7-ad50-ce13b352474a.png)

from this view it's possible to change every single task status
![image](https://user-images.githubusercontent.com/44255116/189897510-1400dd15-b64e-449f-98cd-79ff4fa6efeb.png)

### BPMn diagram Editor
![image](https://user-images.githubusercontent.com/44255116/189895268-edb4117d-0399-4d53-b082-cde96a4d6fbc.png)

### Statistics
table and graph about execution of task over time.
![image](https://user-images.githubusercontent.com/44255116/191963013-0a006a25-a1b3-47f2-a9ca-e016b2f03e49.png)

### Default username
the default username is _admin_ with password defined during the _node install.js_ process.<br>
go to [users management interface](users) for documentation.<br>
