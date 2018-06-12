console.log('   /...Loading [SessionRoutes]');
// EXTERNAL
var express = require("express");
// INTERNAL
var SessionController = require('./session.controller');
var router = express.Router();
// ROUTES
router.put("/", SessionController.update);
module.exports = router;
