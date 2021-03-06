var Models = require('../models');
var base64url = require('b64url');
var querystring = require('querystring');
var https = require('https');
var http = require('http');
var _ = require('underscore');

module.exports = function(config) {

    var Game = Models.Game;
    var Feature = Models.Feature;
    var GameFeature = Models.GameFeature;
    var User = Models.User;
    var GameData = Models.GameData;

	var api = {};

	api.read = function(req,res) {
        if(req.userID) {
            if(req.query.find == 'true') {
                console.log('FINDING GAMES');
                getTokenForCode(req.code, config.facebook.clientID, config.facebook.clientSecret, function(token) {
                    
                    var authURL = 'https://graph.facebook.com/me/friends';
                    authURL += '?method=GET';
                    authURL += '&format=json';
                    authURL += '&access_token=' + token.access_token;
                   
                    https.get(authURL, function (response) {
                      var buffer = '';
                      response.on('data', function(chunk) {
                        buffer += chunk
                      });
                      response.on('end', function() {



                        var friends = JSON.parse(buffer).data;

    
                        
                        var nonRelatedGames = [];
                        var related; 
                        var sent = false;   
                        if(!friends ||
                         friends.length == 0) {

                              Game.find(function(err, games) {
                                games.forEach(function(game) {
                                    related = false;
                                    game.data.forEach(function(data) {
                                        if(data.fbID == req.userID) related = true; 
                                    })
                                    if(!related) nonRelatedGames.push(game);
                                    console.log('loop');
                                });
                                console.log('res1');
                                res.send(nonRelatedGames);
                              });   
                            
                        }else {
                            var friendsIDs = [];
                            _.each(friends, function(friend) {
                                friendsIDs.push(friend.id);
                            });
                            User.find({'fbID': { $in: friendsIDs }}, function(err, users) {

                                if(users.length == 0) {
                                    Game.find(function(err, games) {
                                        games.forEach(function(game) {
                                            related = false;
                                            game.data.forEach(function(data) {
                                                if(data.fbID == req.userID) related = true;
                                                console.log('loop2'); 
                                            })
                                            if(!related) nonRelatedGames.push(game);
                                        });
                                        console.log('res2');
                                        res.send(games);
                                    }); 
                                }else {
                                    users.forEach(function(user) {
                                        Game.find({'_id': {$in: user.games}}, function(err,games){
                                            console.log('RETURNING:',games);
                                            res.send(games); 
                                        }); 
                                    }); 
                                }
                                
                            });
                        }
                        

                      });
                    }); 
                });

            } else {
                console.log('My Games');
                User.findOne({fbID: req.userID}, function(err, user) {
                    if(user)
                       Game.find({'_id' : { $in: user.games }}, function(err, games) {
                            res.send(games);    
                       });
                    else
                        Game.findOne( 'first', function(err, game) {
                            res.send(game);
                        })
                });
            }
            
        }else {
            if(req.query.find == 'true') {
               Game.find(function(err, games) {
                    res.send(games);
               });
            }else {
                Game.findOne( 'first', function(err, game) {
                    res.send(game);
                });
            }
           
        }  
    }

	api.create = function(req, res) {
        var data = req.body;
        console.log(req.userID);
      
        User.findOne({fbID: req.userID}, function(err, user) {

            console.log('here', err, user);

            if(!user) return res.send(403, {error: 'auth_error'});
            user =null;
             Feature.find( {'_id': { $in: data.features} }, function(err, features) {
            
           
           

            var total = 0;
            var feature,
            i = features.length;
            var gameFeatures = {};
            while(--i > -1) {
                feature = features[i];
                switch( feature.type ) {
                    case 0 :
                        if(!gameFeatures._0) {
                            gameFeatures._0 = new GameFeature();
                            gameFeatures._0.type = 0;
                            gameFeatures._0.image = feature.image;
                        }
                        gameFeatures._0.amount += feature.factor;
                    break;
                    case 1 :
                        if(!gameFeatures._1) {
                            gameFeatures._1 = new GameFeature();
                            gameFeatures._1.type = 1;
                            gameFeatures._1.image = feature.image;
                        }
                        gameFeatures._1.amount += feature.factor;
                    break;
                    case 2 :
                        if(!gameFeatures._2) {
                            gameFeatures._2 = new GameFeature();
                            gameFeatures._2.type = 2;
                            gameFeatures._2.image = feature.image;
                        }
                        gameFeatures._2.amount += feature.factor;
                    break;
                    case 3 :
                        if(!gameFeatures._3) {
                            gameFeatures._3 = new GameFeature();
                            gameFeatures._3.type = 3;
                            gameFeatures._3.image = feature.image;
                        }
                        gameFeatures._3.amount += feature.factor;
                    break;
                    case 4 :
                        if(!gameFeatures._4) {
                            gameFeatures._4 = new GameFeature();
                            gameFeatures._4.type = 4;
                            gameFeatures._4.image = feature.image;
                        }
                        gameFeatures._4.amount += feature.factor;
                    break;
                    case 5 :
                        if(!gameFeatures._5) {
                            gameFeatures._5 = new GameFeature();
                            gameFeatures._5.type = 5;
                            gameFeatures._5.image = feature.image;
                        }
                        gameFeatures._5.amount += feature.factor;
                    break;
                    case 6 :
                        if(!gameFeatures._6) {
                            gameFeatures._6 = new GameFeature();
                            gameFeatures._6.type = 6;
                            gameFeatures._6.image = feature.image;
                        }
                        gameFeatures._6.amount += feature.factor;

                    break;

                } 
                total += feature.price;
            }
            var gameFeaturesArray = [];
            for(var key in gameFeatures) gameFeaturesArray.push(gameFeatures[key]);

            data.features = gameFeaturesArray;
            var game = new Game(data);

            game.value = total;
            
            User.findOne({fbID: req.userID}, function(err, user) {                         
                if(user.cash >= total) {
                    user.games.push(game._id);
                    
                    var authURL = 'http://api.wordnik.com//v4/words.json/randomWord';
                    authURL += '?hasDictionaryDef=true';
                    authURL += '&minLength=3';
                    authURL += '&maxLength=8';
                    authURL += '&includePartOfSpeech=noun';
                    authURL += '&api_key=b2d9add059b15b5b8800c01235f0597462ca01800619b5db6';
                    
                   
                    http.get(authURL, function (response) {
                        var buffer = '';
                          response.on('data', function(chunk) {
                            buffer += chunk
                          });
                          response.on('end', function() {

                        
                            var word = JSON.parse(buffer);
                            console.log(word);
                             game.fbID = req.userID;
                             game.name = word.word;
                            game.save(function(err, model){
                                user.save(function(err, user) {
                                    console.log(game)
                                  res.send(game);     
                                });
                            });
                        })

                       
                    });
                    
                }else {
                    console.log('HAck');
                    res.send('hack_error');
                    // SOME ONE is trying to hack
                }
            }); 
        });
        })

       
	}

	api.update = function(req, res) {
       
       if(!req.userID) {
        return res.send(403, {error: 'auth_error'});
       }

        Game.findOne({_id: req.body._id}, function(err, p) {
          if (!p)
            return next(new Error('Could not load Document'));
          else {
            // do your updates here
            p.modified = new Date();



            p.data = req.body.data;

            





            p.save(function(err) {
                  if (err)
                    console.log('error')
                  else {
                   
                    res.send(p)
                  }

                   
                }); 

           

           
          }
        });
	}

	api.del = function(req, res){

	}

	return api;
}






function getTokenForCode(code, AppID, AppSecret, callback){
    
    var authURL = 'https://graph.facebook.com/oauth/access_token?';
    authURL += 'client_id=' + AppID;
    authURL += '&redirect_uri=';
    authURL += '&client_secret=' + AppSecret;
    authURL += '&code=' + code.replace('\'', '');
    https.get(authURL, function (response) {
      var buffer = '';
      response.on('data', function(chunk) {
        buffer += chunk
      });
      response.on('end', function() {
        callback(querystring.parse(buffer));   
      });
    }); 
}

    


function parseSignedRequest(signed_request, secret) {
    var crypto = require('crypto');
    encoded_data = signed_request.split('.',2);
    // decode the data
    sig = encoded_data[0];
    json = base64url.decode(encoded_data[1]);
    data = JSON.parse(json); // ERROR Occurs Here!
    
    // check algorithm - not relevant to error
    if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
        console.error('Unknown algorithm. Expected HMAC-SHA256');
        return null;
    }
 
    // check sig - not relevant to error
    expected_sig = crypto.createHmac('sha256',secret).update(encoded_data[1]).digest('base64').replace(/\+/g,'-').replace(/\//g,'_').replace('=','');
    if (sig !== expected_sig) {
        console.error('Bad signed JSON Signature!');
        return null;
    }
 
    return data;
}