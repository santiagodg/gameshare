const express = require('express')
const req = require('express/lib/request')
const mongoose = require('mongoose')
const { isLoggedIn, isCommentAuthorOrAdmin } = require('../middleware')
const { handle } = require('./util/util')
const List = require('../models/list')
const Comment = require('../models/comment')

var router = express.Router()

// Delete comment from list
router.delete('/:commentId', isLoggedIn, isCommentAuthorOrAdmin, async (req, res) => {
    const commentId = req.params.commentId
    const [deletedComment, deletedError] = await handle(Comment.findByIdAndDelete(commentId))
    if (deletedError) {
        return res.status(400).render('bad-request')
    }

    const [updateList, errorUpdate] = await handle(List.findOneAndUpdate({ _id : req.body.listOfComment }, { $pull : { comments : commentId } }, { new : true }))
    if (errorUpdate) {
        console.log(errorUpdate)
        return res.status(400).render('bad-request')
    }
    
    // req.flash('success', 'Comment deleted successfully.');
    res.redirect(`/list/${req.body.listOfComment}`)
})

module.exports = router