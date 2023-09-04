const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const { createProxyMiddleware } = require('http-proxy-middleware');

// pass the session to the connect sqlite3 module
// allowing it to inherit from session.Store
const SQLiteStore = require('connect-sqlite3')(session);

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();

const projectConfig = require('./utils').projectConfig;
const logoutPath = projectConfig['logout_path'];
const host = projectConfig['this_host'];
const resourcePath = projectConfig['resource_path'];
const proxyAddr = projectConfig['proxy_addr'];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.pluralize = require('pluralize');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(resourcePath, express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: projectConfig['cookie_sec'],
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: new SQLiteStore({db: 'sessions.db', dir: path.join(__dirname, 'var', 'db')})
}));
// app.use(csrf());
app.use(passport.authenticate('session'));
app.use(function (req, res, next) {
    const msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !!msgs.length;
    req.session.messages = [];
    next();
});
app.use(function(req, res, next) {
    res.locals.csrfToken = 'asdhjasfhjhlk';
    next();
});

app.locals.resourcePath = resourcePath;
app.locals.loginPath = projectConfig['login_path'];

app.use('/', authRouter);
app.use('/', indexRouter);

app.use(createProxyMiddleware(proxyAddr, {
    ws: true,
    changeOrigin: false,
    selfHandleResponse: true,  // Need to handle response on our end
    onProxyRes: function(proxyRes, req, res) {
        const contentType = proxyRes.headers['content-type'];
        const isHtmlContent = contentType && contentType.includes('text/html');
        const isHtmlFile = req.url.toLowerCase().endsWith('.html');

        // Only handle HTML content and avoid .html files
        if (isHtmlContent && !isHtmlFile) {
            let body = [];
            proxyRes.on('data', function(chunk) {
                body.push(chunk);
            });
            proxyRes.on('end', function() {
                body = Buffer.concat(body).toString();

                // Here we add a floating logout button to the HTML
                const logoutButtonHTML = `<div style="position:fixed;right:10px;top:10px;z-index:9999;">
                    <button style="
                        background-color: #f44336; /* Red */
                        border: none;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 50%;
                        box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease 0s;
                    " onclick="location.href='${logoutPath}'">Logout</button>
                </div>`;
                body = body.replace('</body>', logoutButtonHTML + '</body>');

                // Update the content-length header
                res.setHeader('Content-Length', Buffer.byteLength(body));
                res.setHeader('Content-Type', 'text/html; charset=utf-8'); // Ensure it's treated as HTML
                res.end(body);
            });
        } else {
            // For non-HTML responses, pipe the response directly
            proxyRes.pipe(res);
        }
    }
}));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.locals.error = {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
