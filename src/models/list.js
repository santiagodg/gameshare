const mongoose = require('mongoose');

var listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Like"
        }
    ],
    games: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game"
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model("List", listSchema)