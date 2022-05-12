const Comment = require('./models/comment')
const { handle } = require('./controllers/util/util')


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log("You must be signed in first")
        return res.redirect('/login')
    }
    next();
}

module.exports.isAdmin = async (req, res, next) => {
    if (req.user === undefined) {
        return res.redirect('/login');
    }

    if (!req.user.isAdmin) {
        return res.redirect('/');
    }

    next();
}

module.exports.noCache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

// Validating if user has the proper authorization to act upon a comment
module.exports.isCommentAuthorOrAdmin = async(req, res, next) => {
    if(!req.user.isAdmin){
        console.log(req.user._id)
        const commentId  = req.params.commentId
        const [comment, commentError] = await handle(Comment.findById(commentId))
        if (commentError){
            return res.status(400).render('bad-request', { user: req.user })
        }

        if(!comment.author._id.equals(req.user._id)){
            console.log('Unauthorized action')
            req.flash('error', 'You are not authorized to do that.')
            // TODO: Add directory
            return res.redirect('/')
        }
        return next()
    }
    return next()
}