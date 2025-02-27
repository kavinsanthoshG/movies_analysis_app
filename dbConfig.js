require('dotenv').config()
console.log(process.env)
const config = {
    user: process.env.AZUREUSERNAME,
    password: process.env.AZURESQLDBPASSWORD,
    server: process.env.AZURESERVER,
    database: process.env.AZUREDB,
    options: {
        encrypt: true, // Use encryption
        enableArithAbort: true
    }
};

module.exports = config;