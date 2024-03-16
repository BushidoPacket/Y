const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },
    
    salt: {
        type: String,
        required: true
    },

    creationDate: {
        type: String,
        default: Date.now()
    },

    profilePicture: {
        type: String,
        default: "../profile_pictures/default.png",
    },
})

const User = mongoose.model("User", UserSchema)

module.exports = User;