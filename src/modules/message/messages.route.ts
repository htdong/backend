console.log('   /...Loading [MessagesRoutes]');

// External
var express = require("express");

// Internal
var MessagesController = require('./messages.controller');
var router = express.Router();

router.get("/", MessagesController.module1x);
router.get("/:_id", MessagesController.module12);
// router.put("/:_id", MessagesController.module16);
router.delete("/:_id", MessagesController.module18);

module.exports = router;
