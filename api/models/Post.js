const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    
    text: {
        type: String,
        required: true,
    },
    
    timestamp: {
        type: String,
        default: Date.now()
    },

    editStamp: {
        type: String,
    },
})

const Post = mongoose.model("Post", PostSchema)

module.exports = Post;