console.log('   /...Loading [GkClientRoutes]');

// External
var express = require("express");

// Internal
var GkClientsController = require('./gkClients.controller');
var router = express.Router();

// Routes
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last
router.get("/masterListPagination", GkClientsController.module1x);
router.get("/dashboardPagination", GkClientsController.module5x);

router.get("/download", GkClientsController.module22);
router.get("/history", GkClientsController.module29);

router.get("/datasource", GkClientsController.datasource);

router.get("/api/masterList", GkClientsController.apiMasterList);
router.get("/api/lzMasterList", GkClientsController.lazyDataForFormControl);
router.get("/request/findsert/:_id", GkClientsController.module32); // Request
router.get("/request/:_id", GkClientsController.findRequestById);



router.post("/upload", GkClientsController.module21); // Collective
router.post("/upsert", GkClientsController.module23); // Collective
router.post("/disableCollective", GkClientsController.module24); // Collective
router.post("/enableCollective", GkClientsController.module25); // Collective
router.post("/markCollective", GkClientsController.module26); // Collective
router.post("/unmarkCollective", GkClientsController.module27); // Collective
router.post("/deleteCollective", GkClientsController.module28); // Collective

router.put("/request/:_id", GkClientsController.module33); // Request


// Individial - CRUD
router.post("/entry", GkClientsController.module11);
// router.post("/", GkClientsController.module11); // Individual
router.get("/:_id", GkClientsController.module12);
// router.get("/:_id", GkClientsController.module12);
router.put("/:_id", GkClientsController.module13);
// router.put("/:_id", GkClientsController.module13); // Individual
router.patch("/:_id/disable", GkClientsController.module14);
// router.patch("/disable/:_id", GkClientsController.module14);
router.patch("/:_id/enable", GkClientsController.module15);
// router.patch("/enable/:_id", GkClientsController.module15);
router.patch("/:_id/mark", GkClientsController.module16);
// router.patch("/mark/:_id", GkClientsController.module16);
router.patch("/:_id/unmark", GkClientsController.module17);
// router.patch("/unmark/:_id", GkClientsController.module17);
router.delete("/:_id", GkClientsController.module18);
// router.delete("/:_id", GkClientsController.module18);
router.get("/:_id/changes", GkClientsController.module19);
// router.get("/viewChange/:_id", GkClientsController.module19);

// Collective - Master
router.get("/", GkClientsController.module1x);

// Collective - CRUD
router.post("/upload", GkClientsController.module21);
router.get("/download", GkClientsController.module22);
router.post("/upsert", GkClientsController.module23);
router.post("/status/disable", GkClientsController.module24);
router.post("/status/enable", GkClientsController.module25);
router.post("/status/mark", GkClientsController.module26);
router.post("/status/unmark", GkClientsController.module27);
router.post("/delete", GkClientsController.module28);
router.get("/changes", GkClientsController.module29);

// Request - Process
router.get("/requests/:_id", GkClientsController.module32); // findOrUpsertBlankObjectOfRequest
router.put("/requests/:_id", GkClientsController.module33); // saveObjectOfRequest
router.get("/requests/:_id/changes", GkClientsController.module39); // findOrUpsertBlankObjectOfRequest

// Request - Master
router.get("/requests", GkClientsController.module3x);

// Request - MJE of Object supplement (Super User and Admin tasks)
// router.post("/requests/:_id/mje", GkClientsController.module41);
router.patch("/requests/:_id/post", GkClientsController.module42);
router.patch("/requests/:_id/revert", GkClientsController.module43);
// router.patch("/requests/:_id/approval", GkClientsController.module44);
// router.patch("/requests/:_id/status", GkClientsController.module45);

// Dashboard - CRUD
router.post("/dashboard/entry", GkClientsController.module51);
router.get("/dashboard/:_id", GkClientsController.module52);
router.put("/dashboard/:_id", GkClientsController.module53);
router.delete("/dashboard/:_id", GkClientsController.module58);

// Dashboard - Master
router.get("/dashboard", GkClientsController.module5x);

// Summary Report - CRUD
router.post("/sreports/entry", GkClientsController.module61);
router.get("/sreports/:_id", GkClientsController.module62);
router.put("/sreports/:_id", GkClientsController.module63);
router.delete("/sreports/:_id", GkClientsController.module68);

// Summary Report - Master
router.get("/sreports", GkClientsController.module6x);

// Detail Report - CRUD
router.post("/dreports/entry", GkClientsController.module71);
router.get("/dreports/:_id", GkClientsController.module72);
router.put("/dreports/:_id", GkClientsController.module73);
router.delete("/dreports/:_id", GkClientsController.module78);

// Summary Report - Master
router.get("/dreports", GkClientsController.module7x);

// Form Control
router.get("/controls", GkClientsController.lazyDataForFormControl);
router.get("/controls/list", GkClientsController.listDataForFormControl);

module.exports = router;
