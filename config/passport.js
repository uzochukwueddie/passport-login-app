const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/User');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('local.signup', new LocalStrategy({ 
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push('Passwords do not match');
    return done(null, false, req.flash('error', errors));
  }

  User.findOne({ email: email}).then(user => {
    errors.push('User With Email Already Exist.');
    if (user) {
      return done(null, false, req.flash('error', errors));
    }

    const newUser = new User();
    newUser.name = req.body.name;
    newUser.email = req.body.email;
    newUser.password = req.body.password;

    newUser.save((err) => {
        return done(null, newUser);
    });
  });
}));

passport.use('login', new LocalStrategy({ 
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  let errors = [];
  User.findOne({email: email}).then(user => {
    if (!user) {
      errors.push('User with email does not exist');
      return done(null, false, req.flash('error', errors));
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      } else {
        errors.push('Password is incorrect');
        return done(null, false, req.flash('error', errors));
      }
    });
  });
}));