console.log('   /...Loading [SessionRoutes]');

// External
var express = require("express");

// Internal
var SessionController = require('./session.controller');
var router = express.Router();

// Routes
router.put("/", SessionController.update);

module.exports = router;
