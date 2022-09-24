import sys
import requests
from requests.exceptions import HTTPError
import getopt


def usage():
    print("\nplease use paramenter:\n" \
        "-f for full change the status on all workflows\nor\n" \
        "-w name of workflow to change the status\n+\n" \
        "-j name of job to change the status\n" \
        "-a action (0,1,2) -> 0 = not running, 1 = Running, 2 = Error\n" \
        "-h this usage\n" \
        "-v verbose\n\n" \
        "-p server port\n\n" \
        "-s server name\n\n" \
        "Example : python start_all_task.py -a 1 -f -p 80 -s localhost\n"
    )
  
def single_change_status(wf, job,status,verbose,url):
    if ( verbose ) : print ("starting  change to status : " + status+ " for workflow" + wf + " on job " + job + "\n")
    try:
        response = requests.post(url + '/login', data = {'username':'admin', 'password':'password','api' : 1 })
        print ("response : " + response + "\n")
        response.raise_for_status()    
        authResp = response.json()        
        access_token = authResp["token"]
        if ( verbose ) : 
            # print ("response : " + response + "\n")
            print ("token : " + access_token+ "\n")
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')
        print(f'HTTP error occurred: {response}')
        sys.exit()
    except Exception as err:
        print(f'Other error occurred: {err}')
        sys.exit()

    try:
        my_headers = {'X-Access-Token' : access_token}
        qparam = {"wsname": wf , "taskname": job, "status":status}
        response = requests.post(url + '/api/v1/chg_task_status',headers=my_headers,data=qparam)
        response.raise_for_status()    
        WFRespChange = response.json()
        for z in WFRespChange:
            print ("return message : " + z["ErrorMessage"] + "\n")                          

    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')
    except Exception as err:
        print(f'Other error occurred: {err}')  




def full_change_status(status,verbose,url):
    if ( verbose ) : print ("starting full change to status : " + status+ " for all workflows\n")
    try:
        response = requests.post(url + '/login', data = {'username':'admin', 'password':'password','api' : 1 })
        response.raise_for_status()    
        authResp = response.json()    
        access_token = authResp["token"]
        if ( verbose ) : print ("token : " + access_token+ "\n")
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')
        print(f'HTTP error occurred: {response.json()}')
        sys.exit()
    except Exception as err:
        print(f'Other error occurred: {err}')
        sys.exit()

    try:
        my_headers = {'X-Access-Token' : access_token}
        response = requests.get(url + '/api/v1/list/tasks',headers=my_headers)
        response.raise_for_status()    
        WFResp = response.json()        
        for x in WFResp:        
            if ( verbose ) : print ("capturing jobs for  workflow : " + x["name"]+ "\n")
            try:
                my_headers = {'X-Access-Token' : access_token}
                req = url + '/api/v1/jobs/' + x["name"]
                print(req)     
                response = requests.get(req,headers=my_headers)                                     
                response.raise_for_status()    
                WFRespFases = response.json()
                
                for y in WFRespFases:
                    if ( verbose ) : print ("working on workflow : " + x["name"] + " jobs : " + y["jobs"] + "\n")                    
                    try:
                        my_headers = {'X-Access-Token' : access_token}
                        qparam = {"wsname": x["name"] , "taskname": y["jobs"], "status":status}
                        response = requests.post(url + '/api/v1/chg_task_status',headers=my_headers,data=qparam)
                        response.raise_for_status()    
                        WFRespChange = response.json()
                        for z in WFRespChange:
                           print ("return message : " + z["ErrorMessage"] + "\n")                          

                    except HTTPError as http_err:
                        print(f'HTTP error occurred: {http_err}')
                    except Exception as err:
                        print(f'Other error occurred: {err}')  

            except HTTPError as http_err:
                print(f'HTTP error occurred: {http_err}')
            except Exception as err:
                print(f'Other error occurred: {err}')         
        if ( verbose ) : print ("End full change to status : " + status+ " for all workflows\n")  
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')
    except Exception as err:
        print(f'Other error occurred: {err}')   


def main():
    
    try:
        opts, args = getopt.getopt(sys.argv[1:], "ha:s:t:j:h:p:vf", ["help", "action=","task=","job=","host=","port="])
    except getopt.GetoptError:
        # stampa l'informazione di aiuto ed esce:
        usage()
        sys.exit(2)
    output = None
    verbose = False
    action = None
    for o, a in opts:        
        if o == "-v":
            verbose = True
        if o == "-f":
            action = "full"
        if o in ("-h", "--help"):
            usage()
            sys.exit()
        if o in ("-a", "--action"):
            status = a
        if o in ("-t", "--task"):
            action = "single"
            wf = a
            
        if o in ("-j", "--job"):
            job = a
        if o in ("-s", "--server"):
            host = a
        if o in ("-p", "--port"):
            port = a
    url = 'http://' + host + ":" + port

    if (action == "full" and status != ""):
        full_change_status(status,verbose,url)
    if (action == "single" and status != ""):
        single_change_status(wf,job, status,verbose,url)

if __name__ == "__main__":
    main()