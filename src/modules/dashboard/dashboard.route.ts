console.log('   /...Loading [DashboardRoutes]');

// External
var express = require("express");

// Internal
var DashboardController = require('./dashboard.controller');
var router = express.Router();

// Routes
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last
router.get("/pages/:id", DashboardController.findPaginatedDashboardPages);
router.get("/items/:id", DashboardController.getDashboardItems);

module.exports = router;
