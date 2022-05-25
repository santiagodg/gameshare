const express = require('express')
const req = require('express/lib/request')
const mongoose = require('mongoose')
const { isLoggedIn, isAdmin } = require('../middleware')
const { handle, escapeRegex } = require('./util/util')
const Game = require('../models/game')
const List = require('../models/list')
const Like = require('../models/like')
const Comment = require('../models/comment')
const CommentController = require('./comment')

var router = express.Router()

router.get('/', isLoggedIn, async (req, res) => {
    if (req.query.filter) {
        if (req.query.filter == "alphabet") {
            const [lists, listsError] = await handle(List.find({ author: req.user._id, deleted: false }).sort({ 'name': 'asc' }).populate(['likes', 'games', 'comments']).exec())

            if (listsError) {
                res.status(404).render('not-found')
                return
            }

            res.render('list/collection', { lists: lists, filtered_by: req.query.filter, searched_name: undefined, user: req.user })

        } else if (req.query.filter == "likes") {
            const [lists, listsError] = await handle(List.aggregate([
                {
                    $project: {
                        "name": 1,
                        "description": 1,
                        "likes": 1,
                        "amountLikes": { "$size": "$likes" },
                        "comments": 1,
                        "games": 1,
                        "author": 1,
                        "deleted": 1,
                        "createdAt": 1
                    }
                }, { "$match": { author: { "$eq": req.user._id } } }, { "$match": { deleted: { "$eq": false } } }, { "$sort": { "amountLikes": -1 } }
            ]))

            // { "$match" : { author: { "$eq": req.user._id } } }

            if (listsError) {
                res.status(404).render('not-found')
                return
            }

            const [listsPopulated, populatedError] = await handle(List.populate(lists, ['author', 'likes', 'games']))

            if (populatedError) {
                res.status(404).render('not-found')
                return
            }

            res.render('list/collection', { lists: listsPopulated, filtered_by: req.query.filter, searched_name: undefined, user: req.user })

        } else {
            const [lists, listsError] = await handle(List.find({ author: req.user._id, deleted: false }).sort({ 'createdAt': 'desc' }).populate(['author', 'likes', 'games', 'comments']).exec())

            if (listsError) {
                res.status(404).render('not-found')
                return
            }
            res.render('list/collection', { lists: lists, filtered_by: req.query.filter, searched_name: undefined, user: req.user })
        }

    } else if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi')
        const [lists, listsError] = await handle(List.find({ author: req.user._id, name: regex, deleted: false }).sort({ 'name': 'asc' }).populate(['author', 'likes', 'games', 'comments']).populate({ path: 'games', populate: { path: 'image' }, options: { sort: { 'createdAt': 'desc' } } }).exec())

        if (listsError) {
            res.status(404).render('not-found')
            return
        }
        if (lists.length < 1) {
            req.flash('error', 'No list name matched, please try again!')
            res.redirect('back')
        } else {
            res.render('list/collection', { lists: lists, filtered_by: req.query.filter, searched_name: req.query.search, user: req.user })
        }

    } else {
        const [lists, listsError] = await handle(
            List.find({
                author: req.user._id,
                deleted: false
            }).populate(['author', 'likes', 'games', 'comments'])
                .populate({
                    path: 'games',
                    populate: { path: 'image' },
                    options: { sort: { 'createdAt': 'desc' } }
                })
                .exec()
        )

        // console.debug(`DEBUG: /list: received no filter and no search`)

        if (listsError) {
            return res.status(400).render('bad-request', { user: req.user })
        }

        res.render('list/collection', { lists: lists, filtered_by: req.query.filter, searched_name: undefined, user: req.user })
    }
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
    // Create list
    const list = new List({ name: req.body.name, description: req.body.description, author: req.user._id })

    // Passing ids from selectedGames to the actual list
    const selectedGames = req.body.games
    var gameIds = []
    // console.log(selectedGames)
    for (var i in selectedGames) {
        gameIds.push(selectedGames[i])
    }

    list.games = gameIds

    const [newList, error] = await handle(list.save())
    if (error) {
        return res.status(400).render('bad-request', { user: req.user })
    }

    req.flash('success', 'List added successfully.');
    res.redirect('/list')
    // res,redirect('/')
})

// Show all attributes of a list in a single page
router.get('/:id', isLoggedIn, async (req, res) => {
    const [list, listError] = await handle(
        List.findOne({
            _id: req.params.id,
            deleted: false,
        }).populate([
            'author',
            'likes',
            'games',
            {
                path: 'comments',
                populate: 'author',
                options: {
                    sort: {
                        createdAt: -1,
                    },
                },
            },
        ]).exec()
    )

    if (listError) {
        console.error(`Error in GET /list/${req.params.id}: Failed to find list ${req.params.id}: ${JSON.stringify(listError, null, 2)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    res.render('list/single', {
        list,
        user: req.user,
    })
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

        if (req.body.filter && req.body.filter == 'likes') {
            // const [lists, listsError] = await handle(List.find().sort({ 'name' : 'asc' }).populate(['author', 'likes', 'games', 'comments']).exec())
            const [lists, listsError] = await handle(List.aggregate([
                {
                    $project: {
                        "name": 1,
                        "description": 1,
                        "likes": 1,
                        "amountLikes": { "$size": "$likes" },
                        "comments": 1,
                        "author": 1,
                        "deleted": 1,
                        "createdAt": 1
                    }
                }, { "$sort": { "amountLikes": -1 } }
            ]))

            if (listsError) {
                res.status(404).render('not-found')
                return
            }

            const [listsPopulated, populatedError] = await handle(List.populate(lists, ['author', 'likes', 'games']))

            if (populatedError) {
                res.status(404).render('not-found')
                return
            }

            res.render('list/collection', { lists: listsPopulated, filtered_by: req.body.filter, searched_name: req.query.search, user: req.user })

        } else {
            res.redirect('/')
        }
    }
})

// Get edit list view
router.get('/:id/edit', isLoggedIn, async (req, res) => {
    // Because we need the author information for the comments, we use a separate populate to fill the data of the nested attribute of author
    const [list, listError] = await handle(List.findOne({ _id: req.params.id, deleted: false }).populate(['author', 'likes', 'games', 'comments']).populate({ path: 'comments', populate: { path: 'author' }, options: { sort: { 'createdAt': 'desc' } } }).exec())
    if (listError) {
        console.error(`Error in GET /list/${req.params.id}/edit: Failed finding list: ${listError}}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    const [games, gamesError] = await handle(Game.find().sort({ name: 1 }).populate(['ratings', 'reviews']).exec())
    if (gamesError) {
        console.error(`Error in GET /list/${req.params.id}/edit: Failed finding games: ${gamesError}}`)
        res.status(500).render('server-error', { user: req.user })
        return
    }

    res.render('list/edit', { list: list, user: req.user, games })
})

// Edit list
router.put('/:id', isLoggedIn, async (req, res) => {
    const [foundList, foundListError] = await handle(List.findOne({ _id: req.params.id, deleted: false }))

    if (foundListError) {
        console.error(`error in PUT /list/${req.params.id}: failed to find list ${req.params.id}: ${foundListError}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    if (!req.user._id.equals(foundList.author._id)) {
        console.error(`error in PUT /list/${req.params.id}: User ${req.user._id} must be list author to edit.`)
        res.status(403).render('bad-request', { user: req.user })
        return
    }

    foundList.name = req.body.name
    foundList.description = req.body.description
    foundList.games = req.body.games

    const [savedList, savedListError] = await handle(foundList.save())

    if (savedListError) {
        console.error(`error in PUT /list/${req.params.id}: failed to save list ${foundList._id} after updating: ${savedListError}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    req.flash('success', 'List updated successfully.');
    res.redirect(`/list/${req.params.id}`)
})

// Delete list
router.delete('/:id', isLoggedIn, async (req, res) => {
    const [foundList, foundListError] = await handle(
        List.findById(req.params.id)
            .populate('author')
            .exec()
    )

    if (foundListError) {
        console.error(`error in DELETE /list/${req.params.id}: failed to find list ${req.params.id}: ${JSON.stringify(foundListError, null, 2)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // console.debug(`DEBUG: DELETE /list/${req.params.id}: foundList: ${JSON.stringify(foundList, null, 2)}`)

    if (!req.user._id.equals(foundList.author._id) && !req.user.isAdmin) {
        console.error(`error in DELETE /list/${req.params.id}: must be list author or admin to delete.`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    const [deleteLikesResult, deleteLikesError] = await handle(
        Like.deleteMany({
            _id: {
                $in: foundList.likes,
            },
        }).exec()
    )

    if (deleteLikesError) {
        console.error(`error in DELETE /list/${req.params.id}: failed to delete likes of list ${req.params.id}: ${deleteLikesError}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // console.debug(`DEBUG: DELETE /list/${req.params.id}: deleteLikesResult: ${JSON.stringify(deleteLikesResult, null, 2)}`)

    const [deleteCommentsResult, deleteCommentsError] = await handle(Comment.deleteMany({
        _id: {
            $in: foundList.comments,
        },
    }).exec())

    if (deleteCommentsError) {
        console.error(`error in DELETE /list/${req.params.id}: failed to delete comments of list ${req.params.id}: ${deleteCommentsError}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // console.debug(`DEBUG: DELETE /list/${req.params.id}: deleteCommentsResult: ${JSON.stringify(deleteCommentsResult, null, 2)}`)

    const [deleteListResult, deleteListError] = await handle(List.deleteOne({ _id: req.params.id }).exec())
    if (deleteListError) {
        console.error(`error in DELETE /list/${req.params.id}: failed to delete list ${req.params.id}: ${JSON.stringify(deleteListError, null, 2)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    } else if (deleteListResult.deletedCount !== 1) {
        console.error(`error in DELETE /list/${req.params.id}: failed to delete list ${req.params.id}: deleteOne query result: ${JSON.stringify(deleteListResult, null, 2)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // console.debug(`DEBUG: DELETE /list/${req.params.id}: deleteListResult: ${JSON.stringify(deleteListResult, null, 2)}`)

    res.redirect(`/list`)
})

// Adding comment routes
router.use('/:id/comments/', CommentController)

module.exports = router
