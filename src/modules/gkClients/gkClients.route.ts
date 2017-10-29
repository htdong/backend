console.log('   /...Loading [GkClientRoutes]');

// External
var express = require("express");

// Internal
var GkClientsController = require('./gkClients.controller');
var router = express.Router();

// Routes
router.get("/masterListPagination", GkClientsController.findMasterListPagination);
router.get("/download", GkClientsController.download);
//router.get("/api/masterList", GkClientsController.apiMasterList);
//Sequence is important as /:id could cover other get /xxx
router.get("/:_id", GkClientsController.findById);

router.post("/", GkClientsController.create);
router.post("/upload", GkClientsController.upload);
router.post("/upsert", GkClientsController.upsert);
router.post("/disableCollective", GkClientsController.disableCollective);
router.post("/enableCollective", GkClientsController.enableCollective);
router.post("/markCollective", GkClientsController.markCollective);
router.post("/unmarkCollective", GkClientsController.unmarkCollective);
router.post("/deleteCollective", GkClientsController.deleteCollective);

router.put("/:_id", GkClientsController.update);

router.patch("/enable/:_id", GkClientsController.enable);
router.patch("/disable/:_id", GkClientsController.disable);
router.patch("/mark/:_id", GkClientsController.mark);
router.patch("/unmark/:_id", GkClientsController.unmark);

router.delete("/:_id", GkClientsController.delete);

module.exports = router;
