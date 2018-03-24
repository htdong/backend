console.log('   /...Loading [DashboardRoutes]');

// EXTERNAL
var express = require("express");

// INTERNAL
var DashboardController = require('./dashboard.controller');
var router = express.Router();

// ROUTES
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last
router.get("/pages/:id", DashboardController.action1x);
router.get("/items/:id", DashboardController.action12);

module.exports = router;
