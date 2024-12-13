require('dotenv').config();

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

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

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// Express error middleware (err, req, res, next) format
app.use(errorController.getGenericError);

function databaseConnect() {
  return mongoose.connect(process.env.MONGO_CONNECTION_URI);
}

function createDefaultAdmin() {
  return User.findOne().then((user) => {
    if (!user) {
      const defaultUser = new User({
        name: 'Manish Machine',
        email: 'manish.machine@email-this-guy.com',
        cart: { items: [] },
      });
      return defaultUser.save();
    }
    return user;
  });
}

function setup() {
  return databaseConnect().then(createDefaultAdmin);
}

setup()
  .then(() => {
    app.listen(3000, () => console.log('Server listening on port 3000'));
  })
  .catch((err) => {
    console.error('setup error', err);
  });
