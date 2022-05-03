var express = require('express');

const GameModel = require('../../models/game');
const UserModel = require('../../models/user');

const { handle } = require('../util/util');
const { isAdmin } = require('../../middleware');

var router = express.Router();

router.get("/", isAdmin, async (_, res) => {
    res.render('admin/admin', { page: 'admin' });
});

router.get("/games", isAdmin, async (_, res) => {
    const [games, gamesError] = await handle(GameModel.find().exec());

    if (gamesError) {
        console.log(gamesError);

        return res.status(500).send(gamesError);
    }

    res.render('admin/games', { games });
});

router.post('/games', isAdmin, async function (req, res) {
    if (!('name' in req.body) || !('image' in req.body)) {
        return res.status(400).send("'name' and 'image' properties must be set on body of request")
    }

    // Check if it already exists
    const [existentGame, existentError] = await handle(GameModel.findOne({ name: req.body.name }).exec());
    if (existentError) {
        console.log(existentError);
        return res.status(500).send(existentError);
    }
    if (existentGame !== null) {
        // req.flash('error', 'A game with that name already exists.')
        return res.redirect('back')
    }

    const game = new GameModel(req.body);
    const [_, gameSaveError] = await handle(game.save());

    if (gameSaveError) {
        console.log(gameSaveError);
        return res.status(500).send(gameSaveError);
    }

    const [existent1Game, existent1Error] = await handle(GameModel.findOne({ name: req.body.name }).exec())
    if (existent1Error) {
        console.log(existent1Error);
        return res.status(500).send(existent1Error);
    }

    res.send(existent1Game)
})

router.put('/games/:gameID', isAdmin, async function (req, res) {
    let [game, gameError] = await handle(GameModel.findOne({ _id: req.params.gameID }).exec());

    if (gameError || game === undefined) {
        console.log(gameError);

        return res.status(404).send(gameError);
    }

    game.name = req.body.name;

    // Check if it already exists
    const [existentGame, existentError] = await handle(GameModel.findOne({ name: game.name }).exec());
    if (existentError) {
        console.log(existentError);
        return res.status(500).send(existentError);
    }
    if (existentGame !== null && !existentGame._id.equals(req.params.gameID)) {
        // req.flash('error', 'A game with that name already exists.')
        return res.redirect('back')
    }

    game.image = req.body.image;
    game.isVideogame = req.body.isVideogame;
    game.description = req.body.description;
    game.avgRating = req.body.avgRating;
    game.ratings = req.body.ratings;
    game.reviews = req.body.reviews;
    game.deleted = req.body.deleted;

    [game, gameError] = await handle(game.save());

    if (gameError) {
        console.log(gameError);

        return res.status(400).send(gameError);
    }

    const [existent1Game, existent1Error] = await handle(GameModel.findOne({ name: req.body.name }).exec())
    if (existent1Error) {
        console.log(existent1Error);
        return res.status(500).send(existent1Error);
    }

    res.send(existent1Game)
})

router.delete('/games/:gameID', isAdmin, async (req, res) => {
    const opResult = await GameModel.deleteOne({ _id: req.params.gameID }).exec();

    if (opResult.modifiedCount < 1) {
        return res.status(404).redirect('/admin/games');
    }

    res.sendStatus(200);
});

router.get("/users", isAdmin, async (_, res) => {
    const [users, usersError] = await handle(UserModel.find().exec());

    if (usersError) {
        console.log(usersError);

        return res.status(500).send(usersError);
    }

    res.render('admin/users', { users });
});

router.post('/users', isAdmin, async function (req, res) {
    if (!('username' in req.body) || !('email' in req.body)) {
        return res.status(400).send("'username' and 'email' properties must be set on body of request")
    }

    // Check if it already exists
    const [existentUser, existentError] = await handle(UserModel.findOne({ username: req.body.username }).exec());
    if (existentError) {
        console.log(existentError);
        return res.status(500).send(existentError);
    }
    if (existentUser !== null) {
        // req.flash('error', 'A user with that username already exists.')
        return res.redirect('back')
    }

    const user = new UserModel(req.body);
    const [_, userSaveError] = await handle(user.save());

    if (userSaveError) {
        console.log(userSaveError);
        return res.status(500).send(userSaveError);
    }

    const [existent1User, existent1Error] = await handle(UserModel.findOne({ username: req.body.username }).exec())
    if (existent1Error) {
        console.log(existent1Error);
        return res.status(500).send(existent1Error);
    }

    res.send(existent1User)
})

router.put('/users/:userID', isAdmin, async function (req, res) {
    let [user, userError] = await handle(UserModel.findOne({ _id: req.params.userID }).exec());

    if (userError || user === undefined) {
        console.log(userError);

        return res.status(404).send(userError);
    }

    user.username = req.body.username;

    // Check if it already exists
    const [existentUser, existentError] = await handle(UserModel.findOne({ username: user.username }).exec());
    if (existentError) {
        console.log(existentError);
        return res.status(500).send(existentError);
    }
    if (existentUser !== null && !existentUser._id.equals(req.params.userID)) {
        // req.flash('error', 'A game with that name already exists.')
        return res.redirect('back')
    }

    user.isAdmin = req.body.isAdmin;
    user.deleted = req.body.deleted;

    [user, userError] = await handle(user.save());

    if (userError) {
        console.log(userError);

        return res.status(400).send(userError);
    }

    const [existent1User, existent1Error] = await handle(UserModel.findOne({ username: req.body.username }).exec())
    if (existent1Error) {
        console.log(existent1Error);
        return res.status(500).send(existent1Error);
    }

    res.send(existent1User)
})

router.delete('/users/:userID', isAdmin, async (req, res) => {
    const opResult = await UserModel.deleteOne({ _id: req.params.userID }).exec();

    if (opResult.modifiedCount < 1) {
        return res.status(404).redirect('/admin/users');
    }

    res.sendStatus(200);
});

module.exports = router;
