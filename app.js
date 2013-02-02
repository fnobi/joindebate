/**
 * Module dependencies.
 */

var express         = require('express')
  , passport        = require('passport')
  , LocalStrategy   = require('passport-local').Strategy
  , mongoose        = require('mongoose')
  , MongoStore      = require('connect-mongo')(express)
  , config          = require('config')
  , routes          = require(__dirname + '/routes')
  , http            = require('http')
  , path            = require('path');

var models = require(__dirname + '/models');

var User = models.User;
passport.use(new LocalStrategy(
	function(username, password, done) {
		User.findOne(
			{ username: username, password: password },
			function (err, user) {
				done(err, user);
			}
		);
	}
));

passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	User.findOne(
		{ username: username },
		function (err, user) {
			done(err, user);
		}
	);
});

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || config.port || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.cookieParser());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'fnobi bibibi'}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.locals({
	appname: 'loginsample'
});

app.get('/', routes.index);
app.post('/login', passport.authenticate('local', {
	failureRedirect: '/login'
}), function(req, res) {
	res.redirect('/');
});

app.post('/signup', routes.signup);

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

require('start-stop-daemon')(function () {
	mongoose.connect(
		config.mongodb.host,
		config.mongodb.database
	);

	app.use(express.session({
		secret: 'topsecret',
		store: new MongoStore({
			db: config.mongodb.database,
			host: config.mongodb.host,
			clear_interval: 60 * 60 // Interval in seconds to clear expired sessions. 60 * 60 = 1 hour
		}),
		cookie: {
			httpOnly: false,
			// 60 * 60 * 1000 = 3600000 msec = 1 hour
			maxAge: new Date(Date.now() + 60 * 60 * 1000)
		}
	}));

	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});
});