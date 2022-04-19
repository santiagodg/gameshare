require('dotenv').config()

const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
//const flash = require("connect-flash")
const path = require('path')

const User = require('./models/user')

const auth = require('./controllers/auth')
const home = require('./controllers/home')
const admin = require('./controllers/admin/admin')

const seedDB = require('./seed')

const app = express()
const port = process.env.PORT || 5000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//app.use(flash())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const secret = process.env.SESSION_SECRET || 'k298%4UEdh4*G#IUNs'
const sessionConfig = {
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.current_user = req.user;
  //res.locals.success = req.flash('success');
  //res.locals.error = req.flash('error');
  next();
})

app.use('/', home)
app.use('/', auth)
app.use('/admin', admin)

app.use(express.static('src/views/public'))

const dbUrl = process.env.DB_URL || "mongodb://localhost/gameshare"
mongoose.connect(dbUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
  .then(async () => {
    console.log('DB Connected.')

    // Seeding db with games and videogames when needed (and deleting all comments, reviews, ratings and lists)
    // await seedDB()

    app.listen(port, () => {
      console.log(`Gameshare server listening at http://localhost:${port}`)
    });
  })
  .catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
    process.exit(1);
  })

app.get("*", (req, res) => {
  // Message error for later
})