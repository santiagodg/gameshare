const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    isAdmin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema)