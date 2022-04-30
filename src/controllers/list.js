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
    const [games, gamesError] = await handle(Game.find().sort({ name: 1 }))
    if(gamesError){
        return res.status(500).render('server-error')
    }
    // console.log(games)
    res.render('list/new', { games : games })
})

router.post('/', isLoggedIn, async (req, res) =>{
    // Verify that list with that name does not exist for this author
    const [exists, existsError] = await handle(List.findOne({ author : req.user._id, name : req.body.name }))
    
    if(existsError){
        return res.status(500).render('server-error')
    }

    if(exists !== null){
        console.log("Error: A list with that name already exists.")
        // req.flash('A list with that name already exists.')
        return res.redirect('back')
    }

    const list = new List(req.body)
    list.author = req.user._id
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