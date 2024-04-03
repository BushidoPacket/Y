const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    
    text: {
        type: String,
        required: true
    },

    postParentID: {
        type: String,
        required: true
    },
    
    timestamp: {
        type: String,
        default: Date.now()
    },
    
    editStamp: {
        type: String,
    },
})

const Comment = mongoose.model("Comment", CommentSchema)

module.exports = Comment;