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
