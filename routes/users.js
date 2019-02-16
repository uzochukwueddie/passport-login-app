const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator/check');


router.get('/login', (req, res) => {
  const success_message = req.flash('success');
  const errors = req.flash('error');
  res.render('login', {success_message, messages: errors});
});

router.get('/register', (req, res) => {
  const errors = req.flash('error');
  res.render('register', {messages: errors});
});

router.post('/register', 
  [
    check('name').not().isEmpty().withMessage('Name must not be empty'),
    check('email').not().isEmpty().withMessage('Email must not be empty'),
    check('email').isEmail().withMessage('Email is invalid'),
    check('password').isLength({ min: 5 }).withMessage('Password must be at least 5 chars long')
  ],
  (req, res, next) => {
    authValidationResult(req, res, next);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

function authValidationResult(req, res, next) {
  const errors = validationResult(req);
  if(errors.array().length > 0){
    const messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    req.flash('error', messages);
    res.redirect('/users/register');
  }else{
    passport.authenticate('local.signup', {
      successRedirect: '/users/login',
      failureRedirect: '/users/register',
      failureFlash: true
    })(req, res, next);
    req.flash('success', 'Sign Up successful. You can now login.')
  }

}

module.exports = router;