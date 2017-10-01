console.log('   /...Loading [GkClientRoutes]');

// External
var express = require("express");

// Internal
var GkClientsController = require('./gkClients.controller');
var router = express.Router();

// Routes
router.post("/", GkClientsController.create);
router.get("/", GkClientsController.findAll);
router.get("/masterList", GkClientsController.findMasterList);
router.get("/:_id", GkClientsController.findById);
router.put("/:_id", GkClientsController.update);
router.delete("/:_id", GkClientsController.delete);

module.exports = router;
