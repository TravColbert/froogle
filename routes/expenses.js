const express = require('express');
var router = express.Router();

module.exports = function(app) {
  router.get('/',app.tools.checkAuthentication,app.controllers["expenses"].gets);
  router.get('/:id/',app.tools.checkAuthentication,app.controllers["expenses"].get);
  router.get('/:id/actions/edit',app.tools.checkAuthentication,app.controllers["expenses"].editExpenseForm);
  router.post('/',app.tools.checkAuthentication,app.controllers["expenses"].createExpense);
  // router.post('/:id/',app.tools.checkAuthentication,app.controllers["notes"].editNote);
  return router;
};
