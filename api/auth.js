const sha256 = require('crypto-js/sha256');

//Generate random salt
const salt = (length) => {
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*!@#$%^&*()_+-/<>?';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += char.charAt(Math.floor(Math.random() * char.length));
    }

    return result;
}


//Create hashed password and salt and returns both values to store it into DB
const hashPassword = (password) => {
    const lengthOfSalt = Math.floor(Math.random() * 9) + 8;
    const storedSalt = salt(lengthOfSalt);
    const hashedPassword = createHash(password, storedSalt);
    return { 
        saltValue: storedSalt, 
        passwordValue: hashedPassword, 
    };
}
//odule.exports = hashPassword;


//Compare password input with hashed password from DB
const compare = (password, salt, hashedPassword) => {
    return (createHash(password, salt) === hashedPassword);
}
//module.exports = compare;


//Get salt to password and hash it
const createHash = (password, salt) => {
    return sha256(password + salt).toString();
}
//odule.exports = createHash;

module.exports = { hashPassword, compare };

//Tests

//console.log(salt(10));
//console.log(hash('password', "0b"));
//console.log(compare('password', "0b", "4d1d363de10fdc41f211cea72affdb72e0991735fb18ae13aa4f94d660511171"));
//console.log(hashPassword('password'));

//console.log(compare("password", "WcKBR*7h", "4fb6f197a8487e7168b6ceb53e01734a081741492998a5b00172973977b45032"))

//console.log(Math.floor(Math.random() * 9) + 8);

//console.log(compare("123456", "0U<Xh5Y^J_T#E31", "0e1e65da1f3cbd17d4fe06db4dbbbe0526a6cad806008e35f5545509388ce995"));

//console.log(createHash("123456", "5"));
