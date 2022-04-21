const mongoose = require('mongoose')

var ratingSchema = mongoose.Schema({
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Rating", ratingSchema)