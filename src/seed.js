const mongoose = require('mongoose')
const User = require('./models/user')
const Game = require('./models/game')
const List = require('./models/list')
const Rating = require('./models/rating')
const Review = require('./models/review')
const Comment = require('./models/comment')
const { response } = require('express')

const emptyDB = async () => {
    try {
        // await User.deleteMany()
        // console.log("------ Users removed ------")

        await Game.deleteMany()
        console.log("------ Games removed ------")

        await List.deleteMany()
        console.log("------ Lists removed ------")

        await Rating.deleteMany()
        console.log("------ Ratings removed ------")

        await Review.deleteMany()
        console.log("------ Reviews removed ------")

        await Comment.deleteMany()
        console.log("------ Comments removed ------")
    } catch (err) {
        console.log(err)
    }
}

const seedVideogames = async() => {
    // SteamAPI call
        const buffer = await fetch(`https://store.steampowered.com/api/appdetails?appids=${slicedIds[i]}`).then(response => response.json())
        // Then, get only the information we need corresponding to our model definition
        const gameData = buffer[slicedIds[i]]['data']
        const formatBuffer = { name: gameData.name, image: gameData.header_image, description: gameData.detailed_description}
        dummyVideogames.push(formatBuffer)
    }
    // console.log(dummyVideogames)

    const videogames = await Game.create(dummyVideogames)
}

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

const seedDB = async() => {
    await emptyDB()
    try{
        const videogames = await seedVideogames()
        console.log("++++++ Videogames added ++++++")
        
        const boardgames = await seedBoardgames()
        console.log("++++++ Boardgames added ++++++")
    } catch (err){
        console.log(err)
    }
}

module.exports = seedDB;