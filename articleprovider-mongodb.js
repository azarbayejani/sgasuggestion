var mongo = require('mongodb');
var Db = mongo.Db;
var Connection = mongo.Connection;
var Server = mongo.Server;
var BSON = mongo.BSON;
var ObjectID = mongo.ObjectID;


ArticleProvider = function(host,port){
	this.db = new Db('node-mongo-blog', new Server(host,port,{auto_reconnect: true}, {}));
	this.db.open(function(){});
};

ArticleProvider.prototype.getCollection= function(callback) {
  this.db.collection('articles', function(error, article_collection) {
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};

ArticleProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, article_collection){
    if(error) callback(error);
    else {
      article_collection.find().toArray(function(error,results){
        if ( error ) callback(error);
        else callback(null,results);
      });
    }
  });
};


ArticleProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, article_collection){
    if(error) callback(error);
    else {
      article_collection.findOne(
        { _id : article_collection.db.bson_serializer.ObjectID.createFromHexString(id) },
        function(error,result){
        if (error) callback(error);
        else callback(null,result);
      } );
    }
  });
};

ArticleProvider.prototype.save = function(articles, callback) {
  this.getCollection(function(error,article_collection){
    if (error ) callback(error);
    else{
      if ( typeof(articles.length) == "undefined")
        articles = [articles];
      for( var i =0; i< articles.length; i++){
        article = articles[i];
        article.created_at = new Date();
        if(article.comments === undefined) article.comments = [];
        for (var j=0; j<article.comments.length; j++){
          article.comments[j].created_at = new Date();
        }
      }

      article_collection.insert(articles, function() {
        callback(null,articles);
      });
    }
  });
};

ArticleProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
  this.getCollection(function(error, article_collection) {
    if( error ) callback( error );
    else {
      article_collection.update(
        {_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
        {"$push": {comments: comment}},
        function(error, article){
          if( error ) callback(error);
          else callback(null, article);
        });
    }
  });
};

ArticleProvider.prototype.addVoteToArticle = function(articleId, vote, callback) {
  this.getCollection(function(error, article_collection){
    if( error ) callback( error );
    else {
      article_collection.update(
        { _id : article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId) },
        { "$push" : { votes : vote }},
        function ( error, article ) {
          if(error) callback (error);
          else callback(null, article);
        }
      );
    }
  });
};

exports.ArticleProvider = ArticleProvider;