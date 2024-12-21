const csrf = require('csurf');

const csrfProtection = csrf();

exports.csrfProtection = csrfProtection;

exports.csrfWrappedMiddleware = (req, res, next) => {
  if (req.headers['content-type']?.startsWith('multipart/form-data')) {
    return next();
  }
  csrfProtection(req, res, next);
};
