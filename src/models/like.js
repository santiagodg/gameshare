const mongoose = require('mongoose')

var likeSchema = mongoose.Schema({
    score: {
        type: Boolean,
        required: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Like", likeSchema)