var express = require('express')

const { isLoggedIn } = require('../middleware');
const { handle, escapeRegex } = require('./util/util');

const GameModel = require('../models/game')
const RatingModel = require('../models/rating')
const ReviewModel = require('../models/review')

var router = express.Router()

router.get("/", async function (req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const [games, gamesError] = await handle(GameModel.find({ name: regex, deleted: false }).populate(['ratings', 'reviews']).sort({ 'name': 'asc' }));

        if (gamesError) {
            res.status(404).render('not-found');
            return;
        }

        if (games.length < 1) {
            console.log("No game title matched, please try again!");
            res.redirect('back');
        } else {
            res.render('games/list', { games, user: isLoggedIn, searched_title: req.query.search, page: 'games' });
        }
    } else {
        const [games, gamesError] = await handle(GameModel.find({ deleted: false }).populate(['ratings', 'reviews']).sort({ 'name': 'asc' }));

        if (gamesError || games === []) {
            res.status(404).render('not-found');
            return;
        }

        res.render('games/list', { games, user: isLoggedIn, searched_title: undefined, page: 'games' });
    }
});

router.get('/:id', isLoggedIn, async (req, res) => {
    const [game, gameError] = await handle(
        GameModel.findOne({ _id: req.params.id, deleted: false })
            .populate({
                path: 'reviews',
                populate: {
                    path: 'rating'
                }
            })
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author'
                }
            })
            .exec()
    );

    if (gameError || game === null) {
        res.status(404).render('not-found');

        return;
    }

    res.render('games/single', { game, user: req.user, searched_title: undefined });
});

router.post('/:id/rating', isLoggedIn, async (req, res) => {
    const rating = new RatingModel(req.body)

    const [newRating, error] = await handle(rating.save());

    if (error) {
        console.log(error)

        return res.status(400).render('bad-request')
    }

    const [game, gameError] = await handle(GameModel.findOne({ _id: req.params.id, deleted: false }).populate(['ratings', 'reviews']).exec());

    if (gameError || game === null) {
        res.status(400).render('bad-request');

        return;
    }

    let ratingSum = 0
    game.ratings.forEach(rating => {
        ratingSum += rating.score
    })
    const avgRating = ratingSum / game.ratings.length

    const opResult = await GameModel.updateOne(
        { _id: req.params.id },
        {
            '$push': {
                'ratings': newRating._id
            },
            '$set': {
                'avgRating': avgRating
            }
        }
    )

    if (opResult.modifiedCount < 1) {
        return res.status(404).redirect(`/games/${req.params.id}`);
    }

    res.redirect(`/games/${req.params.id}`);
});

router.get('/:id/review', isLoggedIn, async (req, res) => {
    const [game, gameError] = await handle(GameModel.findOne({ _id: req.params.id, deleted: false }).exec());

    if (gameError || game === null) {
        res.status(404).render('not-found');

        return;
    }

    res.render('games/review', { game, user: req.user, searched_title: undefined });
});

router.post('/:id/review', isLoggedIn, async (req, res) => {
    if (req.body.text === null || req.body.text === undefined) {
        console.log(`Games router: POST review: text is required in request body: ${JSON.stringify(req.body)}`)
        res.status(400).render('bad-request')
        return
    }

    if (req.body.rating === null || req.body.rating === undefined) {
        console.log(`Error in games router: POST review: rating is required in request body: ${JSON.stringify(req.body)}`)
        res.status(400).render('bad-request')
        return
    }

    if (req.body.author === null || req.body.author === undefined) {
        console.log(`Error in games router: POST review: author is required in request body: ${JSON.stringify(req.body)}`)
        res.status(400).render('bad-request')
        return
    }

    const ratingDocument = {
        score: req.body.rating,
        author: req.body.author
    }

    const rating = new RatingModel(ratingDocument)

    const [newRating, ratingSaveError] = await handle(rating.save())

    if (ratingSaveError) {
        console.log(`Error in games router: POST review: failed to save rating: ${JSON.stringify(ratingSaveError)}`)
        res.status(400).render('bad-request')
    }

    const reviewDocument = {
        text: req.body.text,
        rating: newRating._id,
        author: req.body.author
    }

    const review = new ReviewModel(reviewDocument)

    const [newReview, reviewSaveError] = await handle(review.save())

    if (reviewSaveError) {
        console.log(`Error in games router: POST review: failed to save review: ${JSON.stringify(reviewSaveError)}`)
        res.status(400).render('bad-request')
        return
    }

    const opResult = await GameModel.updateOne(
        { _id: req.params.id },
        {
            $push: {
                reviews: newReview._id
            }
        }
    )

    if (opResult.modifiedCount < 1) {
        console.log(`Error in games router: POST review: failed to update game with new review: ${JSON.stringify(opResult)}`)
        res.status(400).redirect(`/games/${req.params.id}`)
        return
    }

    res.redirect(`/games/${req.params.id}`);
});

module.exports = router
