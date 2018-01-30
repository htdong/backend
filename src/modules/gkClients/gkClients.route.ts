console.log('   /...Loading [GkClientRoutes]');

// External
var express = require("express");

// Internal
var GkClientsController = require('./gkClients.controller');
var router = express.Router();

// Routes
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last
router.get("/masterListPagination", GkClientsController.findMasterListPagination);
router.get("/viewChange/:_id", GkClientsController.viewChangeById);
router.get("/download", GkClientsController.download);
router.get("/history", GkClientsController.history);
router.get("/api/masterList", GkClientsController.apiMasterList);
router.get("/api/lzMasterList", GkClientsController.apiLazyMasterList);
router.get("/request/findsert/:_id", GkClientsController.findOrCreateRequestById); // Request
router.get("/request/:_id", GkClientsController.findRequestById);
router.get("/:_id", GkClientsController.findById);

router.post("/", GkClientsController.create); // Individual
router.post("/upload", GkClientsController.upload); // Collective
router.post("/upsert", GkClientsController.upsert); // Collective
router.post("/disableCollective", GkClientsController.disableCollective); // Collective
router.post("/enableCollective", GkClientsController.enableCollective); // Collective
router.post("/markCollective", GkClientsController.markCollective); // Collective
router.post("/unmarkCollective", GkClientsController.unmarkCollective); // Collective
router.post("/deleteCollective", GkClientsController.deleteCollective); // Collective

router.put("/request/:_id", GkClientsController.updateRequest); // Request
router.put("/:_id", GkClientsController.update); // Individual

router.patch("/enable/:_id", GkClientsController.enable);
router.patch("/disable/:_id", GkClientsController.disable);
router.patch("/mark/:_id", GkClientsController.mark);
router.patch("/unmark/:_id", GkClientsController.unmark);

router.delete("/:_id", GkClientsController.delete);

module.exports = router;
