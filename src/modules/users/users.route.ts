console.log('   /...Loading [UsersRoutes]');

var express = require("express");
var UsersController = require('./users.controller');

var router = express.Router();

router.get("/apiListPagination", UsersController.findAPIListPagination);

router.post("/authenticate", UsersController.authenticate);
router.post("/register", UsersController.register);
router.post("/forgot", UsersController.forgot);
router.post("/", UsersController.create);
router.get("/", UsersController.findAll);
router.get("/:_id", UsersController.findById);
router.put("/:_id", UsersController.update);
router.delete("/:_id", UsersController.delete);

module.exports = router;
