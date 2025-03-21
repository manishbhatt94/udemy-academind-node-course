require('dotenv').config();

const path = require('path');

const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const { csrfWrappedMiddleware } = require('./middlewares/csrf');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

const User = require('./models/user');

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

const sessionStore = new MongoDBStore({
  uri: process.env.MONGO_CONNECTION_URI,
  collection: 'sessions',
});

app.use(
  session({
    secret: process.env.SESSION_COOKIE_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(csrfWrappedMiddleware);

app.use(flash());

app.use((req, res, next) => {
  const userIdFromSession = req.session.user?._id;
  if (!userIdFromSession) {
    return next();
  }
  User.findById(userIdFromSession)
    .then((user) => {
      if (!user) {
        return next();
      }
      // storing reference to mongoose document obj, so we have access to
      // the methods defined in User model, as well
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log('Error in fetching user in middleware', err);
      next();
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.loggedInUserEmail = req.session.user?.email;
  res.locals.csrfToken = req.csrfToken?.();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// Express error middleware (err, req, res, next) format
app.use(errorController.getGenericError);

function databaseConnect() {
  return mongoose.connect(process.env.MONGO_CONNECTION_URI);
}

function setup() {
  return databaseConnect();
}

setup()
  .then(() => {
    app.listen(3000, () => console.log('Server listening on port 3000'));
  })
  .catch((err) => {
    console.error('setup error', err);
  });
