const mongoose = require('mongoose')

var reviewSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    rating: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating"
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Review", reviewSchema)