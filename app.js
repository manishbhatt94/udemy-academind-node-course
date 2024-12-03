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
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
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

function setup() {
  defineDatabaseRelations();
  return sequelize.sync();

  function defineDatabaseRelations() {
    User.hasMany(Product);
    Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

    User.hasOne(Cart);
    Cart.belongsTo(User);

    Cart.belongsToMany(Product, { through: CartItem });
    Product.belongsToMany(Cart, { through: CartItem });
  }
}

function createDummyUser() {
  return User.findByPk(1).then((user) => {
    if (!user) {
      console.log('Creating dummy user');
      return User.create({ email: 'john.doe@fake.users.com', name: 'John Doe' });
    }
    console.log('Dummy user already exists');
    return user;
  });
}

function createCartForDummyUser() {
  let dummyUser = null;
  return User.findByPk(1)
    .then((user) => {
      dummyUser = user;
      return dummyUser.getCart();
    })
    .then((cart) => {
      if (!cart) {
        console.log('Creating new dummy cart');
        return dummyUser.createCart();
      }
      console.log('Dummy cart already exists');
      return cart;
    });
}

setup()
  .then(createDummyUser)
  .then(createCartForDummyUser)
  .then(() => {
    app.listen(3000, () => console.log('Server listening on port 3000'));
  })
  .catch((err) => {
    console.error('setup error', err);
  });
