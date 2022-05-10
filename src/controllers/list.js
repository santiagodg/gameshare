const express = require('express')
const req = require('express/lib/request')
const mongoose = require('mongoose')
const { isLoggedIn, isAdmin } = require('../middleware')
const { handle } = require('./util/util')
const Game = require('../models/game')
const List = require('../models/list')
const Like = require('../models/like')
const CommentController = require('./comment')

var router = express.Router()

router.get('/', isLoggedIn, async (req, res) => {
    res.render('list/collection', { user: req.user })
})

router.get('/new', isLoggedIn, async (req, res) => {
    const [games, gamesError] = await handle(Game.find().sort({ name: 1 }).populate(['ratings', 'reviews']).exec())
    if (gamesError) {
        console.log(`Error in GET /list/new: Failed finding games: ${gamesError}}`)
        return res.status(500).render('server-error', { user: req.user })
    }
    // console.log(games)
    res.render('list/new', { games: games, user: req.user })
})

router.post('/', isLoggedIn, async (req, res) => {
    // Verify that list with that name does not exist for this author
    const [exists, existsError] = await handle(List.findOne({ author: req.user._id, name: req.body.name }))
    if (existsError) {
        console.log(`Error in POST /list: List already exists: ${existsError}}`)
        return res.status(500).render('server-error', { user: req.user })
    }

    if (exists !== null) {
        console.log("Error: A list with that name already exists.")
        // req.flash('A list with that name already exists.')
        return res.redirect('back')
    }

    // Else, create list
    const list = new List({ name: req.body.name, description: req.body.description, author: req.user._id })

    // Passing ids from selectedGames to the actual list
    const selectedGames = req.body.games
    var gameIds = []
    // console.log(selectedGames)
    for (var i in selectedGames) {
        gameIds.push(selectedGames[i])
    }
    console.log(`Debug: POST /list: ${gameIds}`)
    list.games = gameIds

    const [newList, error] = await handle(list.save())
    if (error) {
        return res.status(400).render('bad-request', { user: req.user })
    }

    // req.flash('List added successfully.')
    res.redirect('/list')
    // res,redirect('/')
})

// Show all attributes of a list in a single page
router.get('/:id', isLoggedIn, async (req, res) => {
    // Because we need the author information for the comments, we use a separate populate to fill the data of the nested attribute of author
    const [list, listError] = await handle(List.findOne({ _id: req.params.id }).populate(['author', 'likes', 'games', 'comments']).populate({ path: 'comments', populate: { path: 'author' }, options: { sort: { 'createdAt': 'desc' } } }).exec())
    if (listError) {
        return res.status(400).render('bad-request', { user: req.user })
    }
    res.render('list/single', { list: list, user: req.user })
})

// Update like/dislike attribute of a list
router.post('/:id', isLoggedIn, async (req, res) => {
    const likeState = req.body.like
    if (likeState != undefined) {
        if (likeState == "addNew") {
            const like = await Like.create({ liked: true, author: req.user._id })
            const [updateList, errorUpdate] = await handle(List.findOneAndUpdate({ _id: req.params.id }, { $push: { likes: like } }, { new: true }))
            if (errorUpdate) {
                return res.status(400).render('bad-request', { user: req.user })
            }
        } else {
            const likeId = req.body.like
            const [disliked, errorDisliked] = await handle(Like.findOneAndDelete({ _id: likeId }))
            if (errorDisliked) {
                return res.status(400).render('bad-request', { user: req.user })
            }
            const [updateList, errorUpdate] = await handle(List.findOneAndUpdate({ _id: req.params.id }, { $pull: { likes: likeId } }, { new: true }))
            if (errorUpdate) {
                console.log(errorUpdate)
                return res.status(400).render('bad-request', { user: req.user })
            }
        }
        res.redirect('/')
    }
})

// Soft delete list
router.post('/:id/toggle-softdelete', isLoggedIn, async (req, res) => {
    const [foundList, foundListError] = await handle(List.findOne({ _id: req.params.id }))

    if (foundListError) {
        console.log(foundListError)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    if (!(req.user.isAdmin || req.user._id === foundList.author._id)) {
        console.log(`ListRouter.post(${req.params.id}): User (${req.user._id}) must be admin or author of list.`)
        res.status(403).render('bad-request', { user: req.user })
    }

    foundList.deleted = !foundList.deleted

    const [savedList, savedListError] = await handle(foundList.save())

    if (savedListError) {
        console.log(savedListError)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    res.redirect('/list')
})

// Adding comment routes
router.use('/:id/comments/', CommentController)

module.exports = router
