var express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const { handle, escapeRegex } = require('./util/util')
const List = require('../models/list')

var router = express.Router()

router.get('/', async function (req, res) {
    if (!req.isAuthenticated()) {
        res.render('home/landing-page', { page: 'landing' })
    } else {
        if (req.query.filter) {
            if (req.query.filter == "alphabet") {
                const [lists, listsError] = await handle(List.find().sort({ 'name' : 'asc' }).populate(['author', 'likes', 'games', 'comments']).exec())
    
                if (listsError) {
                    res.status(404).render('not-found')
                    return
                }
                res.render('home/home', { lists: lists, filtered_by : req.query.filter, searched_name: undefined, user: req.user })

            } else if (req.query.filter == "likes") {
                // const [lists, listsError] = await handle(List.find().sort({ 'name' : 'asc' }).populate(['author', 'likes', 'games', 'comments']).exec())
                const [lists, listsError] = await handle(List.aggregate([
                    {
                        $project: {
                            "name": 1,
                            "description": 1,
                            "likes" : 1,
                            "amountLikes": { "$size" : "$likes" },
                            "comments": 1,
                            "author": 1,
                            "deleted": 1,
                            "createdAt": 1
                        }
                    }, { "$sort": { "amountLikes" : -1 } }
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

                res.render('home/home', { lists: listsPopulated, filtered_by : req.query.filter, searched_name: undefined, user: req.user })

            }else {
                const [lists, listsError] = await handle(List.find().sort({ 'createdAt' : 'desc' }).populate(['author', 'likes', 'games', 'comments']).exec())
    
                if (listsError) {
                    res.status(404).render('not-found')
                    return
                }
                res.render('home/home', { lists: lists, filtered_by : req.query.filter, searched_name: undefined, user: req.user })
            }

        } else if (req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi')
            const [lists, listsError] = await handle(List.find({ name: regex, deleted: false }).sort({ 'name' : 'asc' }).populate(['author', 'likes', 'games', 'comments']).exec())
    
            if (listsError) {
                 res.status(404).render('not-found')
                return
            }
            if (lists.length < 1) {
                req.flash('error', 'No list name matched, please try again!')
                res.redirect('back')
            } else {
                res.render('home/home', { lists: lists, filtered_by: undefined, searched_name: req.query.search, user: req.user })
            }
    
        } else {

            const [lists, listsError] = await handle(List.find({ deleted: false }).sort({ _id: -1 }).populate(['author', 'likes', 'games', 'comments']).exec())
            if (listsError) {
                return res.status(500).render('server-error', { user: req.user })
            }
            res.render('home/home', { lists: lists, filtered_by: undefined, searched_name: undefined,  user: req.user })
        }
    }
})

module.exports = router
