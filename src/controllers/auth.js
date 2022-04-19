var express = require('express')
const path = require('path')
const User = require('../models/user')
const passport = require('passport')

var router = express.Router()

// Render the register view
router.get('/register', (req, res) => {
    if (req.isAuthenticated()) {
        console.log('To register a new account, log out first')
        //req.flash('error', 'To register a new account, log out first')
        // TO-DO: Add directory
        return res.redirect('/')
    }
    res.render('./auth/register', { page: 'register' })
})

// Validate data and submit registered user
router.post('/register', async (req, res) => {
    try {
        const { user } = req.body
        if (user.password != user.confirm_password) {
            console.log("The passwords do not match.")
            //req.flash('error', 'The passwords do not match.')
            res.redirect('/register')
        } else {
            const user_buffer = new User({ email: user.email, username: user.username })
            const new_user = await User.register(user_buffer, user.password)
            req.login(new_user, e => {
                if (e) {
                    console.log(e)
                    //req.flash('error', e.message)
                } else {
                    console.log(new_user)
                    //req.flash('success', 'Welcome to GameShare, ' + req.user.username + '!')
                }
            })

            // TO-DO: Add directory
            res.redirect('/')
        }
    } catch (e) {
        console.log("Error: " + e.message);
        //req.flash('error', e.message)
        res.redirect('/register')
    }
})

// Render the login view
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        console.log('You are already logged in, if you want to log in with a new account first log out')
        //req.flash('error', 'You are already logged in, if you want to log in with a new account first log out')
        // TO-DO: Add directory
        return res.redirect('/')
    }
    res.render('./auth/login', { page: 'login' })
})

// Validate login information and start session
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    console.log("Logged in")
    //req.flash('success', 'Welcome back, ' + req.user.username + '!');
    // TO-DO: Add directory
    res.redirect('/')
})

// Terminate user session
router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = router