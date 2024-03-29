/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
var cas = require('cas-client');

var auth = cas.getMiddleware('https://login.umd.edu/cas', 'http://localhost:3000');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret : "PrigitteTheC4t" }));
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

function checkAuth(req, res, next){
	if( !req.session.user_id){
		res.send('Not authorized!');
	}else{
		next();
	}
}

app.configure('development', function(){
  app.use(express.errorHandler());
});

var articleProvider= new ArticleProvider('localhost',27017);

app.get('/', function(req, res){
    articleProvider.findAll( function(error,docs){
        res.render('index.jade',  {
            title: 'SSGA',
            articles: docs
            }
        );
    });
});

app.get('/login', function(req,res){

});

app.get('/validate', function(req,res){

});

app.get('/blog/new', checkAuth, function(req, res){
	res.render('blog_new.jade', {
		title : 'New Post'
	});
});

app.post('/blog/new', checkAuth, function(req, res){
	articleProvider.save({
		title : req.param('title'),
		body : req.param('body')
	}, function (error , docs){
		res.redirect('/');
	});
});

app.get('/blog/:id',function(req, res){
	console.log("what.");
	articleProvider.findById(req.params.id, function(error, article){
		res.render('blog_show.jade',{
			title : article.title, "article" : article
		});
	});
});

app.post('/blog/addComment', function(req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'));
       });
});

app.post('/blog/vote', function(req,res){
	articleProvider.addVoteToArticle(req.param('_id'), {

	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
