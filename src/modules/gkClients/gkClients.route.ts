console.log('   /...Loading [GkClientRoutes]');

// External
var express = require("express");

// Internal
var GkClientsController = require('./gkClients.controller');
var router = express.Router();

// Routes
router.post("/", GkClientsController.create);
// router.get("/", GkClientsController.findAll);
// router.get("/masterList", GkClientsController.findMasterList);
router.get("/masterListPagination", GkClientsController.findMasterListPagination);
router.get("/download", GkClientsController.download);
router.get("/:_id", GkClientsController.findById);

router.put("/:_id", GkClientsController.update);

router.patch("/enable/:_id", GkClientsController.enable);
router.patch("/disable/:_id", GkClientsController.disable);
router.patch("/mark/:_id", GkClientsController.mark);
router.patch("/unmark/:_id", GkClientsController.unmark);

router.delete("/:_id", GkClientsController.delete);

router.post("/upload", GkClientsController.upload);
router.post("/upsert", GkClientsController.upsert);

module.exports = router;
