const { query, validationResult, matchedData } = require('express-validator');

const ITEMS_PER_PAGE = 4;

function pageValidate() {
  return query('page').optional().isInt({ min: 1 }).toInt();
}

function getPaginationHelper(mongooseModel) {
  return function paginationHelper(req, res, next) {
    const validationMiddleware = pageValidate();
    validationMiddleware(req, res, () => {
      const result = validationResult(req);
      let { page } = matchedData(req, { includeOptionals: true });
      page = page || 1;
      if (!result.isEmpty()) {
        return res.redirect(`${req.path}?page=${page}`);
      }
      mongooseModel
        .countDocuments()
        .then((totalItems) => {
          const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
          if (page > totalPages) {
            return res.redirect(`${req.path}?page=${totalPages}`);
          }
          res.locals.pagination = {
            skip: (page - 1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
            currentPage: page,
            hasPrevious: page > 1,
            hasNext: page < totalPages,
            totalPages,
            totalItems,
            itemsPerPage: ITEMS_PER_PAGE,
          };
          next();
        })
        .catch(next);
    });
  };
}

module.exports = getPaginationHelper;
