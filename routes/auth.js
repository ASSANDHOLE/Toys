const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const db = require('../db');

const configUtils = require('../utils');
const loginPath = configUtils.projectConfig['login_path'];
const logoutPath = configUtils.projectConfig['logout_path'];


/* Configure password authentication strategy.
 *
 * The `LocalStrategy` authenticates users by verifying a username and password.
 * The strategy parses the username and password from the request and calls the
 * `verify` function.
 *
 * The `verify` function queries the database for the user record and verifies
 * the password by hashing the password supplied by the user and comparing it to
 * the hashed password stored in the database.  If the comparison succeeds, the
 * user is authenticated; otherwise, not.
 */
passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
        if (err) {
            return cb(err);
        }
        if (!row) {
            return cb(null, false, {message: 'Incorrect username or password.'});
        }

        crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) {
                return cb(err);
            }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                return cb(null, false, {message: 'Incorrect username or password.'});
            }
            return cb(null, row);
        });
    });
}));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, {id: user.id, username: user.username});
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});


const router = express.Router();

/* GET /login
 *
 * This route prompts the user to log in.
 *
 * The 'login' view renders an HTML form, into which the user enters their
 * username and password.  When the user submits the form, a request will be
 * sent to the `POST /login/password` route.
 */
router.get(loginPath, function (req, res, next) {
    res.render('login');
});

/* POST /login/password
 *
 * This route authenticates the user by verifying a username and password.
 *
 * A username and password are submitted to this route via an HTML form, which
 * was rendered by the `GET /login` route.  The username and password is
 * authenticated using the `local` strategy.  The strategy will parse the
 * username and password from the request and call the `verify` function.
 *
 * Upon successful authentication, a login session will be established.  As the
 * user interacts with the app, by clicking links and submitting forms, the
 * subsequent requests will be authenticated by verifying the session.
 *
 * When authentication fails, the user will be re-prompted to login and shown
 * a message informing them of what went wrong.
 */
router.post(loginPath + '/password', passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: loginPath,
    failureMessage: true
}));

/* POST /logout
 *
 * This route logs the user out.
 */
router.get(logoutPath, function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


module.exports = router;
