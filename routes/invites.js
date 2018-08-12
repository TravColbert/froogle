const express = require('express');
var router = express.Router();

module.exports = function(app) {
  router.get('/:id/',app.controllers["invites"].attemptAccept);
  router.post('/:id/',app.controllers["invites"].confirmAccept);
  return router;
}