var express = require('express')

const { isLoggedIn } = require('../middleware');
const { handle, escapeRegex } = require('./util/util');

const GameModel = require('../models/game')
const RatingModel = require('../models/rating')
const ReviewModel = require('../models/review')

var router = express.Router()

router.get("/", isLoggedIn, async function (req, res) {
    if (req.query.filter) {
        if (req.query.filter == "alphabet") {
            const [games, gamesError] = await handle(GameModel.find({ deleted: false }).sort({ 'name' : 'asc' }).populate(['ratings', 'reviews']).exec())

            if (gamesError) {
                res.status(404).render('not-found')
                return
            }
            res.render('games/list', { games, user: req.user, filtered_by : req.query.filter, searched_title: undefined, user: req.user })
        } else if (req.query.filter == "ratings") {
            const [games, gamesError] = await handle(GameModel.find({ deleted: false }).sort({ 'avgRating' : 'desc' }).populate(['ratings', 'reviews']).exec())

            if (gamesError) {
                res.status(404).render('not-found')
                return
            }
            res.render('games/list', { games, user: req.user, filtered_by : req.query.filter, searched_title: undefined, user: req.user })

        } else if (req.query.filter == "videogame"){
            const [games, gamesError] = await handle(GameModel.find({ deleted: false, isVideogame: true }).populate(['ratings', 'reviews']).exec())

            if (gamesError) {
                res.status(404).render('not-found')
                return
            }
            res.render('games/list', { games, user: req.user, filtered_by : req.query.filter, searched_title: undefined, user: req.user })
        } else {
            const [games, gamesError] = await handle(GameModel.find({ deleted: false, isVideogame: false }).populate(['ratings', 'reviews']).exec())

            if (gamesError) {
                res.status(404).render('not-found')
                return
            }
            res.render('games/list', { games, user: req.user, filtered_by : req.query.filter, searched_title: undefined, user: req.user })
        }

    } else if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const [games, gamesError] = await handle(GameModel.find({ name: regex, deleted: false }).populate(['ratings', 'reviews']).sort({ 'name': 'asc' }));

        if (gamesError) {
            res.status(404).render('not-found', { user: req.user });
            return;
        }

        if (games.length < 1) {
            // console.log("No game title matched, please try again!");
            req.flash('error', 'No game title matched, please try again!')
            res.redirect('back');
        } else {
            res.render('games/list', { games, user: req.user, filtered_by: undefined, searched_title: req.query.search, page: 'games' });
        }
    } else {
        const [games, gamesError] = await handle(GameModel.find({ deleted: false }).populate(['ratings', 'reviews']).sort({ 'name': 'asc' }));

        if (gamesError || games === []) {
            res.status(404).render('not-found', { user: req.user });
            return;
        }

        res.render('games/list', { games, user: req.user, filtered_by: undefined, searched_title: undefined, page: 'games' });
    }
});

router.get('/:id', isLoggedIn, async (req, res) => {
    const [game, gameError] = await handle(
        GameModel.findOne({ _id: req.params.id, deleted: false })
            .populate([
                {
                    path: 'reviews',
                    populate: ['rating', 'author']
                },
                {
                    path: 'ratings',
                    populate: 'author',
                }
            ])
            .exec()
    );

    if (gameError || game === null) {
        res.status(404).render('not-found', { user: req.user });

        return;
    }

    const userRating = game.ratings.find(rating => rating.author._id.equals(req.user._id))

    res.render('games/single', { game, user: req.user, userRating, searched_title: undefined });
});

router.post('/:id/rating', isLoggedIn, async (req, res) => {
    const rating = new RatingModel(req.body)

    const [newRating, error] = await handle(rating.save());

    if (error) {
        console.log(error)

        return res.status(400).render('bad-request', { user: req.user })
    }

    const [game, gameError] = await handle(GameModel.findOne({ _id: req.params.id, deleted: false }).populate(['ratings', 'reviews']).exec());

    if (gameError || game === null) {
        res.status(400).render('bad-request', { user: req.user });

        return;
    }

    game.ratings.push(newRating)

    let ratingSum = 0
    game.ratings.forEach(rating => {
        ratingSum += rating.score
    })

    game.avgRating = ratingSum / game.ratings.length

    const [savedGame, savedGameError] = await handle(game.save())

    if (savedGameError) {
        console.error(`Error in POST /games/${req.params.id}/rating: Failed to save game: ${JSON.stringify(savedGameError)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    res.redirect(`/games/${req.params.id}`);
});

router.get('/:id/review', isLoggedIn, async (req, res) => {
    const [game, gameError] = await handle(GameModel.findOne({ _id: req.params.id, deleted: false }).exec());

    if (gameError || game === null) {
        res.status(404).render('not-found', { user: req.user });

        return;
    }

    res.render('games/review', { game, user: req.user, searched_title: undefined });
});

// - Find game
// - Create/Overwrite rating
// - Save rating
// - Add rating to game
// - Update avgRating
// - Create review with rating
// - Save review
// - Add review to game
// - Save game
// - Redirect to games/single
router.post('/:id/review', isLoggedIn, async (req, res) => {
    // Find game
    const [foundGame, foundGameError] = await handle(
        GameModel.findOne({ _id: req.params.id, deleted: false })
            .populate([
                {
                    path: 'ratings',
                    populate: 'author',
                },
                {
                    path: 'reviews',
                    populate: ['rating', 'author'],
                }
            ])
            .exec()
    );

    if (foundGameError) {
        console.error(`Error in POST /games/${req.params.id}/review: Failed finding game: ${JSON.stringify(foundGameError)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Create/Overwrite rating (Optional)
    let rating = null
    if (typeof req.body.rating !== "undefined" && req.body.rating !== null && req.body.rating !== "") {
        const ratingScore = parseInt(req.body.rating)

        if (isNaN(ratingScore)) {
            console.error(`Error in POST /games/${req.params.id}/review: rating must be an integer, given ${req.body.rating}.`)
            res.status(400).render('bad-request', { user: req.user })
            return
        }

        if (ratingScore < 1 || 5 < ratingScore) {
            console.error(`Error in POST /games/${req.params.id}/review: rating must be between 1 and 5, given ${ratingScore}.`)
            res.status(400).render('bad-request', { user: req.user })
            return
        }

        // Check if rating exists
        rating = foundGame.ratings.find(rating => rating.author._id.equals(req.user._id))

        if (typeof rating === "undefined") {
            // Create rating
            rating = new RatingModel({
                score: ratingScore,
                author: req.body.author
            })
        } else {
            // Overwrite rating
            rating.score = ratingScore
        }

        // Save rating
        const [newRating, ratingSaveError] = await handle(rating.save())

        if (ratingSaveError) {
            console.log(`Error in POST /games/${req.params.id}/review: failed to save rating: ${JSON.stringify(ratingSaveError)}`)
            res.status(400).render('bad-request', { user: req.user })
            return
        }

        rating = newRating
    }

    // Add rating to game
    if (rating !== null) {
        foundGame.ratings.push(rating)

        // Update avgRating
        let ratingSum = 0

        foundGame.ratings.forEach(rating => {
            ratingSum += rating.score
        })

        foundGame.avgRating = ratingSum / foundGame.ratings.length
    }

    // Create review with rating
    const review = new ReviewModel({
        text: req.body.text,
        rating: rating,
        author: req.body.author
    })

    // Save review
    const [newReview, reviewSaveError] = await handle(review.save())

    if (reviewSaveError) {
        console.error(`Error in POST /games/${req.params.id}/review: Failed to save review: ${JSON.stringify(reviewSaveError)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Add review to game
    foundGame.reviews.push(newReview)

    // Save game
    const [_savedGame, savedGameError] = await handle(foundGame.save())

    if (savedGameError) {
        console.error(`Error in POST /games/${req.params.id}/review: Failed to save game ${foundGame._id}: ${JSON.stringify(savedGameError)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Redirect to games/single
    req.flash('success', 'Review added successfully.')
    res.redirect(`/games/${req.params.id}`)
});

// 1. Find game to update
// 2. Find review to remove in found game
// 4. Remove reference of review from game.reviews
// 5. Delete review from database
// 6. Save game
// 7. Redirect to games/single
router.post('/:id/delete-review', isLoggedIn, async (req, res) => {
    // Find game to update
    const [foundGame, foundGameError] = await handle(
        GameModel.findOne({ _id: req.params.id, deleted: false })
            .populate([
                {
                    path: 'ratings',
                    populate: 'author',
                },
                {
                    path: 'reviews',
                    populate: ['rating', 'author'],
                }
            ])
            .exec()
    );

    if (foundGameError) {
        console.error(`Error in POST /games/${req.params.id}/delete-review: Failed finding game: ${foundGameError}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Find review to remove
    const reviewIndexToRemove = foundGame.reviews.findIndex(gameReview => gameReview._id.equals(req.body.reviewId))

    if (reviewIndexToRemove === -1) {
        console.error(`Error in POST /games/${req.params.id}/delete-review: failed to find review ${req.body.reviewId} in reviews of game ${foundGame._id}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Remove game review link
    foundGame.reviews.splice(reviewIndexToRemove, 1)

    // Delete review from database
    const query = await ReviewModel.deleteOne({ _id: req.body.reviewId });

    if (query.deletedCount !== 1) {
        console.error(`Error in POST /games/${req.params.id}/delete-review: Failed to delete review ${req.body.reviewId}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Save game without review link
    const [_, savedGameError] = await handle(foundGame.save())

    if (savedGameError) {
        console.error(`Error in POST /games/${req.params.id}/delete-review: failed to save game ${foundGame._id} after updating: ${savedListError}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    res.redirect(`/games/${req.params.id}`)
})

module.exports = router
