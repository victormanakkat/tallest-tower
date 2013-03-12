var fs = require('fs');
module.exports = {
    development: {
      version : JSON.parse(fs.readFileSync('./package.json')).version,
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'Tallest Tower Dev'
      },
      db: 'mongodb://localhost/tallest_tower_dev',
      facebook: {
          clientID: "490996157610487"
        , clientSecret: "eb96c08874d3e31a1440a941dabe0c6a"
        , callbackURL: "http://localhost:3000/auth/facebook/callback"
      },
      
    }
  , production: {
      version : JSON.parse(fs.readFileSync('./package.json')).version,
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'Mega Structures'
      },
      db: process.env.MONGOLAB_URI,
      facebook: {
          clientID: process.env.FACEBOOK_APP_ID
        , clientSecret: process.env.FACEBOOK_SECRET
      },

    }
}