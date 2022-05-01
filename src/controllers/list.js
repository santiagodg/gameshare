const express = require('express')
const req = require('express/lib/request')
const mongoose = require('mongoose')
const { isLoggedIn } = require('../middleware')
const { handle } = require('./util/util')
const Game = require('../models/game')
const List = require('../models/list')
const Like = require('../models/like')

var router = express.Router()

router.get('/', isLoggedIn, async (req, res) =>{
    res.render('list/collection')
})

router.get('/new', isLoggedIn, async (req, res) =>{
    const [games, gamesError] = await handle(Game.find().sort({ name : 1 }).populate(['ratings', 'reviews']).exec())
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

    // Else, create list
    const list = new List({ name : req.body.name, description : req.body.description, author : req.user._id })

    // Passing ids from selectedGames to the actual list
    const selectedGames = req.body.games
    var gameIds = []
    // console.log(selectedGames)
    for(var i in selectedGames){
        gameIds.push(selectedGames[i])
    }
    console.log(gameIds)
    list.games = gameIds
    
    const [newList, error] = await handle(list.save())
    if(error){
        console.log(error)
        return res.status(400).render('bad-request')
    }

    // req.flash('List added successfully.')
    res.redirect('/list')
    // res,redirect('/')
})

// Update like/dislike attribute of a list
router.post('/:id', isLoggedIn, async (req, res) =>{
    const likeState = req.body.like
    if (likeState != undefined) {
        if (likeState == "addNew") {
            const like = await Like.create({ liked : true, author : req.user._id })
            const [updateList, errorUpdate] = await handle(List.findOneAndUpdate({ _id : req.params.id }, { $push : { likes : like } }, { new : true }))
            if (errorUpdate) {
                return res.status(400).render('bad-request')
            }
        } else {
            const likeId = req.body.like
            const [disliked, errorDisliked] = await handle(Like.findOneAndDelete({ _id : likeId }))
            if (errorDisliked) {
                return res.status(400).render('bad-request')
            }
            const [updateList, errorUpdate] = await handle(List.findOneAndUpdate({ _id : req.params.id }, { $pull : { likes : likeId } }, { new : true}))
            if (errorUpdate) {
                console.log(errorUpdate)
                return res.status(400).render('bad-request')
            }
        }
        res.redirect('/')
    }
})

module.exports = router