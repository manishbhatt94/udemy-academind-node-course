const createError = require('http-errors');

exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getProductNotFound = (req, res, next) => {
  res.render('product-not-found', {
    pageTitle: 'Product Not Found',
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getGenericError = (err, req, res, next) => {
  console.error('errorlog', err);
  const pageTitle = 'Something went wrong';
  if (!createError.isHttpError(err)) {
    return res.render('generic-error', {
      pageTitle,
      expose: false,
      message: null,
      isAuthenticated: req.session.isLoggedIn,
    });
  }
  const { expose, message } = err;
  if (err.view) {
    console.log('err.view =>', err.view);
    return res.status(err.status).render(err.view, {
      pageTitle,
      expose,
      message: expose ? message : null,
      isAuthenticated: req.session.isLoggedIn,
    });
  }
  res.status(err.status).render('generic-error', {
    pageTitle,
    expose,
    message: expose ? message : null,
    isAuthenticated: req.session.isLoggedIn,
  });
};
