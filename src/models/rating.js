const mongoose = require('mongoose')

var ratingSchema = mongoose.Schema({
    score: {
        type: Number,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Rating", ratingSchema)