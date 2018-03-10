console.log('   /...Loading [NotificationsRoutes]');

// External
var express = require("express");

// Internal
var NotificationsController = require('./notifications.controller');
var router = express.Router();

router.get("/", NotificationsController.module1x);
router.get("/:_id", NotificationsController.module12);
router.put("/:_id/mark", NotificationsController.module16);
router.put("/:_id/unmark", NotificationsController.module17);
router.delete("/:_id", NotificationsController.module18);

module.exports = router;
