exports.get404 = (req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found' });
};

exports.getProductNotFound = (req, res, next) => {
  res.render('product-not-found', { pageTitle: 'Product Not Found' });
};
