const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

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

const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// Express error middleware (err, req, res, next) format
app.use(errorController.getGenericError);

function setup() {
  defineDatabaseRelations();
  return sequelize.sync();

  function defineDatabaseRelations() {
    Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
    User.hasMany(Product);
  }
}

setup()
  .then(() => {
    app.listen(3000, () => console.log('Server listening on port 3000'));
  })
  .catch((err) => {
    console.error('setup error', err);
  });
