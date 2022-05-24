var express = require('express')

const { isLoggedIn } = require('../middleware');
const { handle, escapeRegex } = require('./util/util');

const GameModel = require('../models/game')
const RatingModel = require('../models/rating')
const ReviewModel = require('../models/review');
const game = require('../models/game');

var router = express.Router()

router.get("/", isLoggedIn, async function (req, res) {
    if (req.query.filter) {
        if (req.query.filter == "alphabet") {
            const [games, gamesError] = await handle(GameModel.find({ deleted: false }).sort({ 'name': 'asc' }).populate(['ratings', 'reviews']).exec())

            if (gamesError) {
                res.status(404).render('not-found')
                return
            }
            res.render('games/list', { games, user: req.user, filtered_by: req.query.filter, searched_title: undefined, user: req.user })
        } else if (req.query.filter == "ratings") {
            const [games, gamesError] = await handle(GameModel.find({ deleted: false }).sort({ 'avgRating': 'desc' }).populate(['ratings', 'reviews']).exec())

            if (gamesError) {
                res.status(404).render('not-found')
                return
            }
            res.render('games/list', { games, user: req.user, filtered_by: req.query.filter, searched_title: undefined, user: req.user })

        } else if (req.query.filter == "videogame") {
            const [games, gamesError] = await handle(GameModel.find({ deleted: false, isVideogame: true }).populate(['ratings', 'reviews']).exec())

            if (gamesError) {
                res.status(404).render('not-found')
                return
            }
            res.render('games/list', { games, user: req.user, filtered_by: req.query.filter, searched_title: undefined, user: req.user })
        } else {
            const [games, gamesError] = await handle(GameModel.find({ deleted: false, isVideogame: false }).populate(['ratings', 'reviews']).exec())

            if (gamesError) {
                res.status(404).render('not-found')
                return
            }
            res.render('games/list', { games, user: req.user, filtered_by: req.query.filter, searched_title: undefined, user: req.user })
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
                    populate: 'author',
                    sort: {
                        createdAt: 'desc',
                    },
                },
                {
                    path: 'ratings',
                    populate: 'author',
                }
            ])
            .exec()
    );

    if (gameError || game === null) {
        console.error(`Error in GET /games/${req.params.id}: Failed to find game: ${JSON.stringify(gameError, null, 2)}`)
        res.status(404).render('not-found', { user: req.user });
        return;
    }

    const userRating = game.ratings.find(rating => rating.author._id.equals(req.user._id))

    res.render('games/single', { game, user: req.user, userRating, searched_title: undefined });
});

// Create or overwrite a rating
router.put('/:id/rating', isLoggedIn, async (req, res) => {
    // Find game
    const [game, gameError] = await handle(
        GameModel.findOne({
            _id: req.params.id,
            deleted: false
        }).populate([
            {
                path: 'ratings',
                populate: 'author',
            },
        ]).exec()
    );

    if (gameError || game === null) {
        console.error(`Error in PUT /games/${req.params.id}/rating: Failed to find game: ${JSON.stringify(gameError, null, 2)}`)
        res.status(400).render('bad-request', { user: req.user });
        return;
    }

    console.debug(`DEBUG: PUT /games/${req.params.id}/rating: game: ${JSON.stringify(game, null, 2)}`)

    // Create new rating or overwrite
    const ratingIndex = game.ratings.findIndex(rating => rating.author._id.equals(req.user._id))

    console.debug(`DEBUG: PUT /games/${req.params.id}/rating: ratingIndex: ${JSON.stringify(ratingIndex, null, 2)}`)

    let newRating;
    if (ratingIndex === -1) {
        const rating = new RatingModel(req.body)
        const [savedRating, error] = await handle(rating.save());
        if (error) {
            console.error(`Error in PUT /games/${req.params.id}/rating: Failed to save new rating: ${JSON.stringify(error, null, 2)}`)
            res.status(400).render('bad-request', { user: req.user })
            return
        }

        console.debug(`DEBUG: PUT /games/${req.params.id}/rating: savedRating: ${JSON.stringify(savedRating, null, 2)}`)

        newRating = savedRating
    } else {
        const previouslyAuthoredRating = game.ratings[ratingIndex]

        console.debug(`DEBUG: PUT /games/${req.params.id}/rating: previouslyAuthoredRating: ${JSON.stringify(previouslyAuthoredRating, null, 2)}`)

        game.ratings.splice(ratingIndex, 1)

        console.debug(`DEBUG: PUT /games/${req.params.id}/rating: game.ratings: ${JSON.stringify(game.ratings, null, 2)}`)

        previouslyAuthoredRating.score = req.body.score
        const [savedRating, error] = await handle(previouslyAuthoredRating.save());
        if (error) {
            console.error(`Error in PUT /games/${req.params.id}/rating: Failed to save updated previously authored rating: ${JSON.stringify(error, null, 2)}`)
            res.status(400).render('bad-request', { user: req.user })
            return
        }

        console.debug(`DEBUG: PUT /games/${req.params.id}/rating: savedRating: ${JSON.stringify(savedRating, null, 2)}`)

        newRating = savedRating
    }

    // Update game with new rating
    game.ratings.push(newRating)
    let ratingSum = 0
    game.ratings.forEach(rating => {
        ratingSum += rating.score
    })

    console.debug(`DEBUG: PUT /games/${req.params.id}/rating: game.ratings: ${JSON.stringify(game.ratings, null, 2)}`)

    // Save game
    game.avgRating = ratingSum / game.ratings.length
    const [savedGame, savedGameError] = await handle(game.save())
    if (savedGameError) {
        console.error(`Error in PUT /games/${req.params.id}/rating: Failed to save game: ${JSON.stringify(savedGameError, null, 2)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    console.debug(`DEBUG: PUT /games/${req.params.id}/rating: game.avgRating: ${JSON.stringify(game.avgRating, null, 2)}`)

    // Redirect to games/:id
    res.redirect(`/games/${req.params.id}`);
});

router.get('/:id/review', isLoggedIn, async (req, res) => {
    const [game, gameError] = await handle(
        GameModel.findOne({
            _id: req.params.id,
            deleted: false,
        }).populate({
            path: 'reviews',
            populate: 'author',
        }).exec()
    );

    if (gameError || game === null) {
        console.error(`Error in GET /games/${req.params.id}/review: Failed to find game ${req.params.id}: ${JSON.stringify(gameError, null, 2)}`)
        res.status(404).render('not-found', { user: req.user });
        return;
    }

    const userReview = game.reviews.find(review => review.author._id.equals(req.user._id))
    res.render('games/review', {
        game,
        user: req.user,
        userReview,
        searched_title: undefined
    });
});

// - Find game
// - Create review
// - Save review
// - Add review to game
// - Save game
// - Redirect to games/single
router.put('/:id/review', isLoggedIn, async (req, res) => {
    // Find game
    const [foundGame, foundGameError] = await handle(
        GameModel.findOne({ _id: req.params.id, deleted: false })
            .populate([
                {
                    path: 'reviews',
                    populate: 'author',
                }
            ])
            .exec()
    );

    if (foundGameError) {
        console.error(`Error in POST /games/${req.params.id}/review: Failed finding game: ${JSON.stringify(foundGameError, null, 2)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Create new review or overwrite
    const reviewIndex = foundGame.reviews.findIndex(review => review.author._id.equals(req.user._id))
    let newReview;
    if (reviewIndex === -1) {
        const review = new ReviewModel({
            text: req.body.text,
            author: req.body.author,
        })

        const [savedReview, savedReviewError] = await handle(review.save())
        if (savedReviewError) {
            console.error(`Error in POST /games/${req.params.id}/review: Failed to save new review: ${JSON.stringify(savedReviewError, null, 2)}`)
            res.status(400).render('bad-request', { user: req.user })
            return
        }

        newReview = savedReview
    } else {
        const previouslyAuthoredReview = foundGame.reviews.find(review => review.author._id.equals(req.user._id))
        foundGame.reviews.splice(reviewIndex, 1)
        previouslyAuthoredReview.text = req.body.text
        const [savedReview, savedReviewError] = await handle(previouslyAuthoredReview.save())
        if (savedReviewError) {
            console.error(`Error in POST /games/${req.params.id}/review: Failed to save updated previously authored review: ${JSON.stringify(savedReviewError, null, 2)}`)
            res.status(400).render('bad-request', { user: req.user })
            return
        }

        newReview = savedReview
    }

    // Add review to game
    foundGame.reviews.push(newReview)

    // Save game
    const [_savedGame, savedGameError] = await handle(foundGame.save())

    if (savedGameError) {
        console.error(`Error in POST /games/${req.params.id}/review: Failed to save game ${foundGame._id}: ${JSON.stringify(savedGameError, null, 2)}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Redirect to games/single
    req.flash('success', 'Review added successfully.')
    res.redirect(`/games/${req.params.id}`)
});

// 1. Find game
// 2. Find review in game
// 4. Remove reference of review from game.reviews`
// 5. Save game
// 6. Delete review from database
// 7. Redirect to games/single
router.delete('/:id/review', isLoggedIn, async (req, res) => {
    // Find game
    const [foundGame, foundGameError] = await handle(
        GameModel.findOne({
            _id: req.params.id,
            deleted: false,
        }).populate([
            {
                path: 'reviews',
                populate: 'author',
            },
        ]).exec()
    );

    if (foundGameError) {
        console.error(`Error in DELETE /games/${req.params.id}/review: Failed finding game: ${foundGameError}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Find review to remove
    const reviewIndex = foundGame.reviews.findIndex(review => review.author._id.equals(req.user._id) && review._id.equals(req.body.reviewId))
    if (reviewIndex === -1) {
        console.error(`Error in DELETE /games/${req.params.id}/review: failed to find review ${req.body.reviewId} authored by user ${req.user._id} in reviews of game ${foundGame._id}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Remove game review link
    foundGame.reviews.splice(reviewIndex, 1)

    // Save game
    const [_, savedGameError] = await handle(foundGame.save())
    if (savedGameError) {
        console.error(`Error in DELETE /games/${req.params.id}/review: failed to save game ${foundGame._id} after updating: ${savedGameError}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Delete review from database
    const [deleteResult, deleteError] = await handle(ReviewModel.deleteOne({ _id: req.body.reviewId }).exec());
    if (deleteError || deleteResult.deletedCount !== 1) {
        console.error(`Error in POST /games/${req.params.id}/delete-review: Failed to delete review ${req.body.reviewId}: ${deleteError}`)
        res.status(400).render('bad-request', { user: req.user })
        return
    }

    // Redirect to /games/:id
    res.redirect(`/games/${req.params.id}`)
})

module.exports = router
