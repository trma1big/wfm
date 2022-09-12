require('dotenv').config()
// var glob= require('./module'); 

const crypto = require('crypto');

require('dotenv').config()
// const key = Buffer.from(process.env.key_crypt, 'hex');
// const iv = Buffer.from(process.env.iv_crypt, 'hex');


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
  charactersLength));
   }
   return result;
  }

//Encrypting text
function encrypt(text,key,iv) {
    keyb = Buffer.from(key, 'hex'); 
    ivb = Buffer.from(iv, 'hex'); 
    algorithm = 'aes-256-cbc'; 
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(keyb), ivb);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function create_password(password, iv, key) {  
    const fs = require('fs'); 
    let rawdata = fs.readFileSync('db/users.json');                    
    let users = JSON.parse(rawdata);
    let new_password = encrypt(password,key,iv);
    users.splice(0,1);
    item = {};
    item = {'username': 'admin',
            'password':new_password,
            'entity': 'ALL' ,
            'admin': 1
    };    
    users.push(item);
    const data = JSON.stringify(users);
  
    fs.writeFile('db/users.json', data, (err) => {
        if (err) {
            throw err;
        }  
    });
  };

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var fs = require('fs');


const question1 = () => {
    return new Promise((resolve, reject) => {
      rl.question('do you want to copy distribution files with default conf (Y/N DEFAULT Y)? ', (answer) => {         
        resolve(answer)
      })
    })
  }
  
  const question2 = () => {
    return new Promise((resolve, reject) => {
      rl.question('Insert Admin user password: ', (password) => {               
        resolve(password)
      })
    })
  }
  
  const main = async () => {
    await question1().then(answer => {
        if ( answer === "N") { rl.close();return;}
        else {if ((answer !== "Y") && (answer !== "")) { console.log("you have to answer Y or N....."); rl.close(); return;}}
        fs.copyFile('.env.distribution', '.env', (err) => {
            if (err) throw err;            
        });
        fs.copyFile('db/wfm.json.distribution', 'db/wfm.json', (err) => {
            if (err) throw err;        
        });
        fs.copyFile('db/users.json.distribution', 'db/users.json', (err) => {
            if (err) throw err;            
        });    
    });
   
    const password = "";
    const kcrypt = crypto.randomBytes(32);
    const IVCrypt = crypto.randomBytes(16);
    const text_kcrypt = kcrypt.toString('hex');
    const text_IVCrypt = IVCrypt.toString('hex');   
    await question2().then(password => {
        const data = fs.readFileSync(".env",{encoding:'utf8', flag:'r'});        
        var result = data.replace(/key_crypt=/g, 'key_crypt= ' + text_kcrypt);
        var result_final = result.replace(/iv_crypt=/g, 'iv_crypt= ' + text_IVCrypt);        
        fs.writeFile(".env", result_final, function (err) {
            if (err) return console.log(err);
        });             
        create_password(password, IVCrypt, kcrypt);
    });   
    
    rl.close()
    console.log("Successfull created new crypting token and change the admin password please login with 'admin' and new password.")
  }

main()