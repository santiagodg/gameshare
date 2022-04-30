const express = require('express')
const req = require('express/lib/request')
const mongoose = require('mongoose')
const { isLoggedIn } = require('../middleware')
const Game = require('../models/game')
const List = require('../models/list')

var router = express.Router()

router.get('/new', isLoggedIn, async (req, res) =>{
    const games = await Game.find().sort({ name: 1 })
    // console.log(games)

    res.render('list/new', { games : games })
})

module.exports = router