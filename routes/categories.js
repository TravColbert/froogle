const express = require('express');
var router = express.Router();

module.exports = function(app) {
  router.get('/',app.tools.checkAuthentication,app.controllers["categories"].gets);
  router.get('/:id/',app.tools.checkAuthentication,app.controllers["categories"].get);
  router.get('/:id/actions/edit/',app.tools.checkAuthentication,app.controllers["categories"].editCategoryForm);
  router.post('/',app.tools.checkAuthentication,app.controllers["categories"].createCategory);
  return router;
};
