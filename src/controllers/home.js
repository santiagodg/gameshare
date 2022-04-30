var express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const List = require('../models/list')

var router = express.Router()

router.get('/', async function (req, res) {
    if (!req.isAuthenticated()) {
        res.render('home/landing-page', { page: 'landing' })
    } else {
        const lists = await List.find().sort({_id: -1})
        res.render('home/home', { lists :lists })
    }
})

module.exports = router
