const express = require('express');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.user) {
        return res.render('home');
    }
    next();
});

router.all('*', ensureLogIn('/'), (req, res, next) => {next()});

module.exports = router;
