//
// Quotation application
//
// Do quotations, invoices for customers
//

// TOOLS
var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var errorhandler = require('errorhandler');
var lodash = require("lodash");
var uploader  = require('multer');
var util  = require('util');

// SESSION
var session = require('express-session');
var sqlstore = require('connect-sqlite3')(session);

// custom router
var menuRouter = require('./routes/menuRoutes');
var logRouter = require('./routes/logRoutes');
var optionsRouter = require('./routes/optionsRoutes');
var productRouter = require('./routes/productRoutes');
var customerRouter = require('./routes/customerRoutes');

// var srv to view
var param = {session: null, loc: "", ownerid: 0, err: ""};

// database
var db = require('./model/_db');
var owner = require('./model/ownerObj');

// ensure to have at least one admin with a proper password
db.init();

//
// Express module configuration
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(compression());
//app.use(logger('dev'));
app.use(cookieParser());
app.use(uploader({ dest: './client/uploads/'}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ store: new sqlstore, secret: 'keyboard cat', cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, saveUninitialized: true, resave: true}));
app.use(function(req, res, next) { req.db = db; next(); });
app.use(express.static(path.resolve(__dirname, 'client')));
app.use(function(req, res, next) {
    lodash.assign(param, {session: null, loc: "", pstatus: ""});
    // check if the owner is defined
    req.session.ownerId = 0;
    owner.isOwnerExist(req.db, next, function(row) {
        if (row && row.msg === "ok") {
            req.session.ownerId = row.ownerid;
        }
        owner.findById(req.db, { ownerId: req.session.ownerId }, next, function(ownerObj) {
            req.session.ownerObj = owner.getFlatVersion(ownerObj);
            param.session = req.session;
            app.locals.param = param;
            next();
        });
    });
}).use(function(req, res, next) { req.param = app.locals.param; next(); 
}).use(function(req, res, next) {
    // every non logged session go on homepage, except "/login" and "/in"
    if(!req.param.session.username && req.url !== "/login" && req.url !== "/in")  {
        req.param.loc = "";
        res.render("welcome", {srv:  req.param});
    } else next();
});
//
// use custom router
menuRouter(app);
logRouter(app);
optionsRouter(app);
productRouter(app);
customerRouter(app);


/// Error management
app.use(errorhandler());


// server creation
var server = http.createServer(app);
server.listen(process.env.PORT || 3000, process.env.IP || "127.0.0.1", function() {
    var addr = server.address();
    console.log("Listening : ", addr.address + ":" + addr.port);
});

module.exports = app;
