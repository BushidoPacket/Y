const sha256 = require('crypto-js/sha256');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './private.env' });

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


//Compare password input with hashed password from DB
const compare = (password, salt, hashedPassword) => {
    return (createHash(password, salt) === hashedPassword);
}


//Get salt to password and hash it
const createHash = (password, salt) => {
    return sha256(password + salt).toString();
}



//#######################
//JWT
//#######################


//Create JWT token
const createToken = (user, exp) => {
    return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: exp });
}

const verifyToken = (token) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Error while verifying token: ', err);
            return false;
        } else {
            console.log('Token verified: ', decoded);
            return decoded;
        }
    });
}

//Export modules

module.exports = { hashPassword, compare, createToken, verifyToken };