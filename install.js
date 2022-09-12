require('dotenv').config()
var glob= require('./module'); 


const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var fs = require('fs');

rl.question('do you want to copy distribution files with default conf (Y/N DEFAULT Y)?', function (answer) {
    if ( answer === "N") { rl.close();return;}
    else {if ((answer !== "Y") && (answer !== "")) { console.log("you have to answer Y or N....."); rl.close(); return;}}
    fs.copyFile('.env.distribution', '.env', (err) => {
        if (err) throw err;
        console.log('File .env was copied to destination');
    });
    fs.copyFile('db/wfm.json.distribution', 'db/wfm.json', (err) => {
        if (err) throw err;
        console.log('File db/wfm.json was copied to destination');
    });
    fs.copyFile('db/user.json.distribution', 'db/user.json', (err) => {
        if (err) throw err;
        console.log('File db/user.json was copied to destination');
    });
    console.log("START CONFIGURING ADMIN ACCESS AND ENV PARAMETER.........")
    console.log("You will have to insert the Key Crypt used to crypt user password (tipically 65 chars)")
    console.log("example: 2e8224a7ba5c5a67ca6e018bec55f3936aa11469667142e0deb4c2604e646d90 ")

    console.log("You will have to insert the iv crypt used to crypt user password (tipically more than 30 chars)")
    console.log("example: 95b243eac24577b79eeec50dd1427660 ")


    rl.question('key crypt:', function (key_crypt) {
        rl.question('iv crypt:', function (IVCrypt) {
            fs.readFile(".env2.distribution", 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace(/key_crypt =/g, 'key_crypt = ' + key_crypt);
            var result_final = result.replace(/iv_crypt =/g, 'iv_crypt = ' + IVCrypt);

            fs.writeFile(".env2.distribution", result_final, 'utf8', function (err) {
                if (err) return console.log(err);
            });
            });
            rl.question('Inset Admin user password: ', function (password) {
                console.log(`${key_crypt}, is a citizen of ${IVCrypt} and password is  ${password}`);
                rl.close();
            });
        });
    });
});
rl.on('close', function () {
  console.log('\nExiting from installation script !!!');
  process.exit(0);
});


// const fs = require('fs'); 
// let rawdata = fs.readFileSync(process.env.CONF_FOLDER + '/users.json');
// let users = JSON.parse(rawdata);

// if (typeof req.body.id !== 'undefined' && req.body.id !== '') {     
//   users.splice(parseInt(req.body.id),1)
// }
// if (typeof req.body.admin == 'undefined') { req.body.admin = 0; }
// if (req.body.entity == '') { req.body.entity= "ALL"; }
// let password = glob.encrypt(req.body.password);

// item = {};
// item = {'username': req.body.username.toLowerCase(),
//         'password':password,
//         'entity':req.body.entity ,
//         'admin': parseInt(req.body.admin)
// };

// users.push(item);
// const data = JSON.stringify(users);

// fs.writeFile(process.env.CONF_FOLDER + '/users.json', data, (err) => {
//     if (err) {
//         throw err;
//     }
// });