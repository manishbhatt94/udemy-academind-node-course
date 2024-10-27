const createError = require('http-errors');

exports.get404 = (req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found' });
};

exports.getProductNotFound = (req, res, next) => {
  res.render('product-not-found', { pageTitle: 'Product Not Found' });
};

exports.getGenericError = (err, req, res, next) => {
  const pageTitle = 'Something went wrong';
  if (!createError.isHttpError(err)) {
    return res.render('generic-error', {
      pageTitle,
      expose: false,
      message: null,
    });
  }
  const { expose, message } = err;
  res.status(err.status).render('generic-error', {
    pageTitle,
    expose,
    message: expose ? message : null,
  });
};
