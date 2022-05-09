var express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const { handle } = require('./util/util')
const List = require('../models/list')

var router = express.Router()

router.get('/', async function (req, res) {
    if (!req.isAuthenticated()) {
        res.render('home/landing-page', { page: 'landing' })
    } else {
        const [lists, listsError] = await handle(List.find({ deleted: false }).sort({ _id: -1 }).populate(['author', 'likes', 'games', 'comments']).exec())
        if (listsError) {
            return res.status(500).render('server-error', { user: req.user })
        }
        res.render('home/home', { lists: lists, user: req.user })
    }
})

module.exports = router
