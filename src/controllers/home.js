var express = require('express')
const path = require('path')

var router = express.Router()

router.get('/', function (req, res) {
    if (!req.isAuthenticated()) {
        res.render('home/landing-page', { page: 'landing' })
    } else {
        res.render('home/home')
    }
})

module.exports = router
