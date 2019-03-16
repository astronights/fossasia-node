// server.js
// where your node app starts

// init project
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth2');
const app = express();


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
var userSchema = mongoose.Schema({
    user_id: String,
    display_name: String,
    mode: String,
    points: Number,
    created: {
      type: Date,
      default: Date.now
}});

const User = mongoose.model("User", userSchema);
// http://expressjs.com/en/starter/static-files.html
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true }, function (err) {
 
   if (err) throw err;
 
   console.log('Successfully connected');
 
});

app.use(passport.initialize());
app.use(passport.session());
// http://expressjs.com/en/starter/basic-routing.html
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: 'https://quirky-locket.glitch.me/auth/facebook/callback',
  profileField: ['id', 'email'],
  passReqToCallback : true
}, function(req, accessToken, refreshToken, profile, cb){            
               req.user = {id: profile.id, name: profile.displayName};
  return cb(undefined, profile);
}));

app.route('/auth/facebook').get(passport.authenticate('facebook'));

app.route('/auth/facebook/callback').get(passport.authenticate('facebook', { failureRedirect: '/'}), function(req, res){
  const user = new User({
    user_id: req.user.id,
    display_name: req.user.displayName,
    mode: 'F',
    points: 0
  });
  user.save().then(res => {
                    console.log(res)
                    res.json({...res._doc})
                });
  
});

passport.serializeUser(function(user, done) {
 done(null, user);
});

passport.deserializeUser(function(user, done) {
 done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_APP_ID,
  clientSecret: process.env.GOOGLE_APP_SECRET,
  callbackURL: 'https://quirky-locket.glitch.me/auth/google/callback'
}, function(req, accessToken, refreshToken, profile, cb){
req.user = {id: profile.id, name: profile.displayName};
  cb(undefined, profile);
}));

app.route('/auth/google').get(passport.authenticate('google', { scope: ["profile", "email"] }));

app.route('/auth/google/callback').get(passport.authenticate('google', { failureRedirect: '/'}), function(req, res){
  const user = new User({
    user_id: req.user.id,
    display_name: req.user.displayName,
    mode: 'G',
    points: 0
  });
  user.save().then(res => {
                    console.log(res)
                    res.json({...res._doc})
                });
});

app.get('/privacy', function(req, res){
  res.sendFile(__dirname + '/views/privacy.html');
});

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/fuckall', function(req, res){
  
  res.send({word: "but", src: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fyt3.ggpht.com%2Fa-%2FAAuE7mBsmfV1hR1bzZiATNY-GrN0UrET_AMMuwkCqA%3Ds900-mo-c-c0xffffffff-rj-k-no&imgrefurl=https%3A%2F%2Fwww.youtube.com%2Fuser%2Fbut%2Ffeed%3Factivity_view%3D1&docid=gAoCuNgVC7VQEM&tbnid=kAFQTwXeOFX8xM%3A&vet=10ahUKEwjun5Xt8oXhAhXS4XMBHbgfDW8QMwhJKAAwAA..i&w=900&h=900&bih=610&biw=1280&q=but&ved=0ahUKEwjun5Xt8oXhAhXS4XMBHbgfDW8QMwhJKAAwAA&iact=mrc&uact=8"});
});  

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
