const express = require('express');
const session = require('express-session');
require('dotenv').config();
const app = express();
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const students = require('./students.json')


const{
    SERVER_PORT,
    SESSION_SECRET,
    DOMAIN,
    CLIENT_ID,
    CLIENT_SECRET,
    CALLBACK_URL
} = process.env

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Auth0Strategy({
    domain: DOMAIN,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: 'http://localhost:3005/login/callback',
    scope: 'openid email profile'
}, function(accessToken, refreshToken, extraParams, profile, done){
    console.log(profile)
    done(null, profile)
}))

passport.serializeUser( (user, done) => {
    done(null, { clientID: user.id, email: user._json.email, name: user._json.name });
  });

passport.deserializeUser( (obj, done) => {
    done(null, obj);
  });

  app.get( '/login',
  passport.authenticate('auth0'));
  app.get('/login/callback',
  passport.authenticate('auth0', 
    { successRedirect: '/students', failureRedirect: '/login', connection: 'github' }
  )
);


function authenticated(req, res, next) {
    if( req.user ) {
      next()
    } else {
      res.sendStatus(401);
    }
  }

app.get('/students', ( req, res, next ) => {
  res.status(200).send(students)
});



app.listen(SERVER_PORT, () => console.log(`Listenting on port: ${SERVER_PORT}`))
