console.log('   /...Loading [SessionRoutes]');

// External
var express = require("express");

// Internal
var SessioController = require('./session.controller');
var router = express.Router();

// Routes
router.put("/", SessioController.update);

module.exports = router;
