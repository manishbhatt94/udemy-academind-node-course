const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');

function getFlashMessage(req) {
  let message = req.flash('error');
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  return message;
}

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: getFlashMessage(req),
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: getFlashMessage(req),
    oldInput: { email: '', password: '', confirmPassword: '' },
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: result.array()[0].msg,
    });
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              if (err) {
                return next(err);
              }
              res.redirect('/');
            });
          } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
          }
        })
        .catch(next);
    })
    .catch(next);
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: result.array()[0].msg,
      oldInput: { email, password, confirmPassword },
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => res.redirect('/login'))
    .catch(next);
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: getFlashMessage(req),
  });
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      req.flash('error', 'Failed to reset. Please try again!');
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour = 60 * 60 * 1000 ms
        console.log(user);
        return user.save();
      })
      .then(() => {
        console.log(`Click this link to reset password: http://localhost:3000/reset/${token} `);
        res.redirect('/');
      })
      .catch(next);
  });
};

exports.getNewPassword = (req, res, next) => {
  const { token } = req.params;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.redirect('/reset');
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'Update Password',
        token,
        userId: user._id,
        errorMessage: getFlashMessage(req),
      });
    })
    .catch(next);
};

exports.postNewPassword = (req, res, next) => {
  const { userId, token, password: newPassword } = req.body;
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Existing user not found');
        return res.redirect('/reset');
      }
      return bcrypt
        .hash(newPassword, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then(() => res.redirect('/login'))
        .catch(console.error);
    })
    .catch(next);
};
