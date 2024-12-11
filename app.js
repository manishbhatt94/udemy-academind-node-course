const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// app.set('views', 'views');

// console.log("app.get('views') =", app.get('views'));
// app.locals.basedir = app.get('views');
// console.log('app.locals.basedir =', app.locals.basedir);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('67596e5b3c07e87ba515b672')
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(next);
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// Express error middleware (err, req, res, next) format
app.use(errorController.getGenericError);

function databaseConnect() {
  return mongoose.connect('mongodb://localhost:27017/test_database_01');
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
