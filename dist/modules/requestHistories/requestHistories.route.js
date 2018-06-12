console.log('   /...Loading [RequestFilesRoutes]');
// EXTERNAL
var express = require("express");
// INTERNAL
var RequestHistoriesController = require('./requestHistories.controller');
var router = express.Router();
// ROUTES
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last
router.get("/list/:_id", RequestHistoriesController.findHistoriessByRequestId);
module.exports = router;
