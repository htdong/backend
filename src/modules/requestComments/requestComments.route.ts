console.log('   /...Loading [RequestFilesRoutes]');

// EXTERNAL
var express = require("express");

// INTERNAL
var RequestCommentsController = require('./requestComments.controller');
var router = express.Router();

// ROUTES
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last

// REQUEST - OPERATIONS
// Individial - CRUD
router.post("/entry", RequestCommentsController.module11);

router.get("/list/:_id", RequestCommentsController.findCommentsByRequestId);

module.exports = router;
