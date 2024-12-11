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
  User.findById('6756d72a812be431a3f42a3a')
    .then((user) => {
      const { _id, name, email, cart } = user;
      req.user = new User({ _id, name, email, cart });
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
