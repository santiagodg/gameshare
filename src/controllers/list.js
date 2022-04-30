const express = require('express')
const req = require('express/lib/request')
const mongoose = require('mongoose')
const { isLoggedIn } = require('../middleware')
const { handle } = require('./util/util')
const Game = require('../models/game')
const List = require('../models/list')

var router = express.Router()

router.get('/', isLoggedIn, async (req, res) =>{
    res.render('list/collection')
})

router.get('/new', isLoggedIn, async (req, res) =>{
    const games = await Game.find().sort({ name: 1 })
    // console.log(games)

    res.render('list/new', { games : games })
})

router.post('/', isLoggedIn, async (req, res) =>{
    const list = new List(req.body)
    list.author = req.user_id

    const [newList, error] = await handle(list.save())

    if(error){
        console.log(error)
        return res.status(400).render('bad-request')
    }

    // req.flash('List added successfully.')
    res.redirect('/list')
    // res,redirect('/')
})

module.exports = router