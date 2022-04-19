require('dotenv').config()

const express  = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const path = require('path')

const seedDB = require('./seed')

const app = express()
const port = process.env.PORT || 5000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
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


app.get("*", (req, res) =>{
  // Message error for later
})