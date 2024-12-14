const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  // TODO: validate credentials and then store user in session
  User.findById('67596e5b3c07e87ba515b672')
    .then((user) => {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
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
  // TODO: Check if password matches confirmPassword
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        // TODO: Show error to user that an account already exists with the provided email
        return res.redirect('/signup');
      }
      const user = new User({
        email,
        password,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => res.redirect('/login'))
    .catch(next);
};
