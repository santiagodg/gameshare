const mongoose = require('mongoose')
const fetch = require('node-fetch')
const User = require('./models/user')
const Game = require('./models/game')
const List = require('./models/list')
const Rating = require('./models/rating')
const Like = require('./models/like')
const Review = require('./models/review')
const Comment = require('./models/comment')
const passport = require('passport')
const { object } = require('webidl-conversions')
const { type } = require('os')
const { Console } = require('console')
const { response } = require('express')

// ==================
// EMPTYING DB
// ==================

const emptyDB = async () => {
    try {
        // await User.deleteMany()
        // console.log("------ Users removed ------")

        // await Game.deleteMany()
        // console.log("------ Games removed ------")

        await Like.deleteMany()
        console.log("------ Likes removed ------")

        await Rating.deleteMany()
        console.log("------ Ratings removed ------")

        await Comment.deleteMany()
        console.log("------ Comments removed ------")

        await Review.deleteMany()
        console.log("------ Reviews removed ------")

        await List.deleteMany()
        console.log("------ Lists removed ------")

    } catch (err) {
        console.log(err)
    }
}

// ==================
// SEEDING VIDEOGAMES
// ==================

const seedVideogames = async() => {
    // First, do the SteamAPI call for n games
    const allIds = await fetch('https://raw.githubusercontent.com/dgibbs64/SteamCMD-AppID-List/master/steamcmd_appid.json').then(response => response.json())
    const apps = allIds["applist"]["apps"]
    // console.log(apps)
    
    const slicedIds = []
    // Define n so we only look for the information of those n games
    const n = 10
    for (let i = 3; i < n; ++i){
        slicedIds.push(JSON.stringify(apps[i].appid))
    }
    // console.log(slicedIds)
  
    // Now, get all the information available from the games we want
    const dummyVideogames = []
    for (let i = 0; i < slicedIds.length; ++i){
        const buffer = await fetch(`https://store.steampowered.com/api/appdetails?appids=${slicedIds[i]}`).then(response => response.json())
        // Then, get only the information we need corresponding to our model definition
        const gameData = buffer[slicedIds[i]]['data']
        const formatBuffer = { name: gameData.name, image: gameData.header_image, description: gameData.detailed_description}
        dummyVideogames.push(formatBuffer)
    }
    // console.log(dummyVideogames)

    const videogames = await Game.create(dummyVideogames)
}

// ==================
// SEEDING BOARDGAMES
// ==================

const dummyBoardgames = [
    {
        name: "Codenames",
        image: "https://www.researchgate.net/profile/Faheem-Hassan-Zunjani/publication/333796668/figure/fig1/AS:769879581921282@1560565004843/Codenames-The-game-kit-and-Grid-arrangement.jpg",
        isVideogame: false,
        description: "Two teams compete by each having a spymaster give one-word clues that can point to multiple words on the board. The other players on the team attempt to guess their team's words while avoiding the words of the other team. In a variant with 2–3 players, one spymaster gives clues to the other player or players.",
        ratings: [],
        reviews: []
    },
    {
        name: "Munchkin",
        image: "https://en.wikipedia.org/wiki/Munchkin_(card_game)#/media/File:Munchkin_game_cover.jpg",
        isVideogame: false,
        description: "Munchkin is a dedicated deck card game by Steve Jackson Games, written by Steve Jackson and illustrated by John Kovalic. It is a humorous take on role-playing games, based on the concept of munchkins (immature role-players, playing only to win by having the most powerful character possible).",
        ratings: [],
        reviews: []
    },
    {
        name: "Hunt A Killer",
        image: "https://m.media-amazon.com/images/I/81FmIkjQf1L._AC_SL1500_.jpg",
        isVideogame: false,
        description: "Enter the world of Hunt A Killer in our newest murder mystery season: Mallory Rock. This realistic murder mystery game delivers high-quality, hand-crafted evidence that brings a fictional case to life and lets you put on your detective's hat in a murder mystery game that will test your skills.",
        ratings: [],
        reviews: []
    },
    {
        name: "Pandemic",
        image: "https://cf.geekdo-images.com/S3ybV1LAp-8SnHIXLLjVqA__itemrep/img/wAMLbgihOl7dJDHnvqt7OXKEV-4=/fit-in/246x300/filters:strip_icc()/pic1534148.jpg",
        isVideogame: false,
        description: "In Pandemic, several virulent diseases have broken out simultaneously all over the world! The players are disease-fighting specialists whose mission is to treat disease hotspots while researching cures for each of four plagues before they get out of hand.",
        ratings: [],
        reviews: []
    },
    {
        name: "Dungeons & Dragons: Starting Campaign",
        image: "https://i.redd.it/91akv62cyui21.jpg",
        isVideogame: false,
        description: "D&D departs from traditional wargaming by allowing each player to create their own character to play instead of a military formation. These characters embark upon imaginary adventures within a fantasy setting. A Dungeon Master (DM) serves as the game's referee and storyteller, while maintaining the setting in which the adventures occur, and playing the role of the inhabitants of the game world.",
        ratings: [],
        reviews: []
    },
    {
        name: "The Settlers of Catan",
        image: "https://upload.wikimedia.org/wikipedia/en/a/a3/Catan-2015-boxart.jpg",
        isVideogame: false,
        description: "A multiplayer board game designed by Klaus Teuber. It was first published in 1995 in Germany by Franckh-Kosmos Verlag (Kosmos) as Die Siedler von Catan. Players take on the roles of settlers, each attempting to build and develop holdings while trading and acquiring resources. Players gain victory points as their settlements grow; the first to reach a set number of victory points, typically 10, wins.",
        ratings: [],
        reviews: []
    },
    {
        name: "Ticket to Ride",
        image: "https://cdn.cloudflare.steamstatic.com/steam/apps/108230/ss_db143ff6f65fd458a1b2c9ac3ba50070ef295203.1920x1080.jpg?t=1572512598",
        isVideogame: false,
        description: "A cross-country train adventure in which players collect and play matching train cards to claim railway routes connecting cities throughout North America. The longer the routes, the more points they earn.",
        ratings: [],
        reviews: []
    },
    {
        name: "Azul",
        image: "https://cf.geekdo-images.com/tz19PfklMdAdjxV9WArraA__itemrep/img/EuG9Te3VDhT58DlEYeEVVunM5wY=/fit-in/246x300/filters:strip_icc()/pic3718275.jpg",
        isVideogame: false,
        description: "Players take turns drafting colored tiles from suppliers to their player board. Later in the round, players score points based on how they've placed their tiles to decorate the palace. Extra points are scored for specific patterns and completing sets; wasted supplies harm the player's score. The player with the most points at the end of the game wins.",
        ratings: [],
        reviews: []
    },
    {
        name: "Magic The Gathering",
        image: "https://upload.wikimedia.org/wikipedia/en/a/aa/Magic_the_gathering-card_back.jpg",
        isVideogame: false,
        description: "A player in Magic takes the role of a Planeswalker, doing battle with other players as Planeswalkers by casting spells, using artifacts, and summoning creatures as depicted on individual cards drawn from their individual decks. A player defeats their opponent typically (but not always) by casting spells and attacking with creatures to deal damage to the opponent's life total with the object being to reduce it from 20 to 0.",
        ratings: [],
        reviews: []
    },
    {
        name: "The Grimwood",
        image: "https://cf.geekdo-images.com/UwXWECg3KARRxSr7ceaxbA__itemrep/img/eCqAnPJVDRjrQrlvcp62LqVGico=/fit-in/246x300/filters:strip_icc()/pic2728951.jpg",
        isVideogame: false,
        description: "This highly chaotic, slightly strategic game for 2-6 players takes you into the dark fantasy of The Grimwood, where you search the forest (i.e., deck) to find settings, animals, or most coveted of all, supernaturals, to add to your collection. Use the powers of the supernaturals to help yourself or sabotage others, or find a Rune or Amulet for extra actions or protection.",
        ratings: [],
        reviews: []
    },
]

const seedBoardgames = async() => {
    const boardgames = await Game.create(dummyBoardgames)
}

// ==================
// SEEDING USERS
// ==================

const dummyUsers = [
    {
        isAdmin: true,
        email: 'mainadmin@email.com',
        username: 'mainAdmin',
        password: '53cret!'
    },
    {
        isAdmin: true,
        email: 'incharge@email.com',
        username: 'theboss',
        password: 'overPaid'
    },
    {
        email: 'regularuser@email.com',
        username: 'regular_user',
        password: 'normal'
    },
    {
        email: 'damian@email.com',
        username: 'damian',
        password: '!vengance'
    },
    {
        email: 'hq@email.com',
        username: 'HarleenQ',
        password: 'redBlack'
    },
    {
        email: 'ivy@email.com',
        username: 'Poi$on_Ivy',
        password: 'trees4Life'
    },
    {
        email: 'harveydent@email.com',
        username: 'h4l5_n_h4lf',
        password: 'heads'
    },
    {
        email: 'jasontodd@email.com',
        username: 'REDMASK',
        password: 'NOMERCY'
    },
    {
        email: 'oswald@email.com',
        username: 'Mr.penguin',
        password: '$$$'
    },
    {
        email: 'selenakyle@email.com',
        username: 'Cat',
        password: 'freedom'
    }

]

const seedUsers = async() => {
    for (let i = 0; i < dummyUsers.length; ++i){
        const user_buffer = new User(dummyUsers[i])
        const new_user = await User.register(user_buffer, dummyUsers[i].password)
    }
}

// ==================
// UTILIS NEEDED
// ==================

const userIds = []
const getUserIds = async() => {
    const n = await User.countDocuments()
    const queries = await User.find().sort({_id: -1}).limit(n)
    for( let i = 0; i < n; ++i){
        userIds.push(queries[i]._id)
    }
    // console.log(userIds)
}

const gameIds = []
const getGameIds = async() => {
    const n = await Game.countDocuments()
    const queries = await Game.find().sort({_id: -1}).limit(n)
    for( let i = 0; i < n; ++i){
        gameIds.push(queries[i]._id)
    }
    // console.log(gameIds)
}

const commentIds = []
const getCommentIds = async() => {
    const n = await Comment.countDocuments()
    const queries = await Comment.find().sort({_id: -1}).limit(n)
    for( let i = 0; i < n; ++i){
        commentIds.push(queries[i]._id)
    }
    // console.log(commentIds)
}

const likeIds = []
const getLikeIds = async() => {
    const n = await Like.countDocuments()
    const queries = await Like.find().sort({_id: 1}).limit(n)
    for( let i = 0; i < n; ++i){
        likeIds.push(queries[i]._id)
    }
    // console.log(likeIds)
}

const ratingIds = []
const getRatingIds = async() => {
    const n = await Rating.countDocuments()
    const queries = await Rating.find().sort({_id: 1}).limit(n)
    for( let i = 0; i < n; ++i){
        ratingIds.push(queries[i]._id)
    }
    // console.log(ratingwIds)
}


const generatingIdsMainFeatures = async() => {
    await getUserIds()
    await getGameIds()
}

const generatingIdsSecondary = async() => {
    await getCommentIds()
    await getLikeIds()
    await getRatingIds()
}


// ==================
// SEEDING COMMENTS
// ==================

var dummyComments = []
const seedComments = async() => {
    dummyComments = [
        {
            text: "Hmm... I think the games do not fit in this list",
            author: userIds[5]
        },
        {
            text: "Dude, you get me :D",
            author: userIds[6]
        },
        {
            text: "I have reaaaally strong opinions about the games in this lists that I think should be noted. First of, playing them is not that great if you have no experience. Second, finding people that are willing to play is HARD. Third, they are all waaaay to expensive. Overall, not recommended if you want to actually have fun",
            author: userIds[5]
        },
        {
            text: "Great list bro!",
            author: userIds[7]
        },
        {
            text: "Seems a little incomplete and inconsistent to me",
            author: userIds[8]
        },
        {
            text: "You are my favorite user honestly, this list is awesome!",
            author: userIds[3]
        },
        {
            text: "Good recs!",
            author: userIds[7]
        },
        {
            text: "First",
            author: userIds[7]
        },
        {
            text: "Not first lol",
            author: userIds[3]
        },
        {
            text: "Dont mind me, just taking notes ;)",
            author: userIds[5]
        },
    ]

    const comments = await Comment.create(dummyComments)
}

// ==================
// SEEDING RATINGS
// ==================

var dummyRatings = []
const seedRatings = async() => {
    dummyRatings = [
        {
            score: 5,
            author: userIds[0]
        },
        {
            score: 5,
            author: userIds[0]
        },
        {
            score: 0,
            author: userIds[0]
        },
        {
            score: 1,
            author: userIds[0]
        },
        {
            score: 2,
            author: userIds[0]
        },
        {
            score: 1,
            author: userIds[0]
        },
        {
            score: 0,
            author: userIds[0]
        },
        {
            score: 0,
            author: userIds[0]
        }
    ]

    const ratings = await Rating.create(dummyRatings)
}

// ==================
// SEEDING LIKES
// ==================

var dummyLikes = []
const seedLikes = async() => {
    dummyLikes = [
        {
            liked: true,
            author: userIds[1]
        },
        {
            liked: true,
            author: userIds[2]
        },
        {
            liked: true,
            author: userIds[3]
        },
        {
            liked: true,
            author: userIds[4]
        },
        {
            liked: true,
            author: userIds[3]
        },
        {
            liked: true,
            author: userIds[0]
        },
        {
            liked: true,
            author: userIds[3]
        },
        {
            liked: true,
            author: userIds[4]
        },
        {
            liked: true,
            author: userIds[5]
        },
        {
            liked: true,
            author: userIds[6]
        },
        {
            liked: true,
            author: userIds[7]
        },
    ]

    const likes = Like.create(dummyLikes)
}

// ==================
// SEEDING REVIEWS
// ==================

var dummyReviews = []
const seedReviews = async() => {
    dummyReviews = [
        {
            text: "This game is so cool!",
            rating: ratingIds[0],
            author: userIds[0]
        },
        {
            text: "Dynamic playing full of twists, always look forward to playing it again.",
            rating: ratingIds[1],
            author: userIds[0]
        },
        {
            text: "ed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
            rating: ratingIds[2],
            author: userIds[0]
        },
        {
            text: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?",
            rating: ratingIds[2],
            author: userIds[0]
        }
    ]

    const reviews = await Review.create(dummyReviews)
}

// ==================
// SEEDING LISTS
// ==================

var dummyLists = []
const seedLists = async() => {
    dummyLists = [
        {
            name: "My favorite games",
            description: "I like all the games added here!",
            likes: [likeIds[0]],
            games: [gameIds[0], gameIds[1]],
            comments: [],
            author: userIds[0]
        },
        {
            name: "The ones I hate the most",
            description: "Terrible, horrifying, disgusting, truly a let down of a game.",
            likes: [likeIds[1], likeIds[2], likeIds[3]],
            games: [gameIds[2], gameIds[3], gameIds[4], gameIds[5], gameIds[6], gameIds[7]],
            comments: [],
            author: userIds[0]
        },
        {
            name: "For spending days playing",
            description: "There are some games that can be completed within a couple of minutes or even hours, but BEHOLD! Here are some games that take so much time to finish or master because of how complex they are.",
            likes: [],
            games: [gameIds[8], gameIds[9], gameIds[10]],
            comments: [],
            author: userIds[0]
        },
        {
            name: "Family destroyers",
            description: "",
            likes: [likeIds[4]],
            games: [gameIds[12], gameIds[13], gameIds[14], gameIds[15], gameIds[16], gameIds[17]],
            comments: [],
            author: userIds[1]
        },
        {
            name: "Games that I have no idea where I bought them",
            description: "",
            likes: [likeIds[5], likeIds[6], likeIds[7], likeIds[8], likeIds[9], likeIds[10]],
            games: [gameIds[1], gameIds[12], gameIds[5], gameIds[7], gameIds[3], gameIds[0]],
            comments: [],
            author: userIds[1]
        },
    ]

    const lists = await List.create(dummyLists)
}

const seedDB = async() => {
    await emptyDB()
    try{
        // const users = await seedUsers()
        // console.log("++++++ Users added ++++++")

        // const videogames = await seedVideogames()
        // console.log("++++++ Videogames added ++++++")
        
        // const boardgames = await seedBoardgames()
        // console.log("++++++ Boardgames added ++++++")

        const mainUtilis = await generatingIdsMainFeatures()

        const likes = await seedLikes()
        console.log("++++++ Likes added ++++++")

        const ratings = await seedRatings()
        console.log("++++++ Ratings added ++++++")

        const comments = await seedComments()
        console.log("++++++ Comments added ++++++")

        const secondaryUtilis = await generatingIdsSecondary()

        const reviews = await seedReviews()
        console.log("++++++ Reviews added ++++++")

        const lists = await seedLists()
        console.log("++++++ Lists added ++++++")

    } catch (err){
        console.log(err)
    }
}

module.exports = seedDB;