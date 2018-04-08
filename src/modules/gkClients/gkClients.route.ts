console.log('   /...Loading [GkClientRoutes]');

// EXTERNAL
var express = require("express");

// INTERNAL
var GkClientsController = require('./gkClients.controller');
var router = express.Router();

// ROUTES
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last

// GET
router.get("/", GkClientsController.module1x);
router.get("/changes", GkClientsController.module29);
router.get("/requests/:_id", GkClientsController.module32); // findOrUpsertBlankObjectOfRequest
router.get("/requests/:_id/changes", GkClientsController.module39); // findOrUpsertBlankObjectOfRequest
router.get("/dashboard", GkClientsController.module5x);
router.get("/dashboard/:_id", GkClientsController.module52);
router.get("/reports/summary", GkClientsController.module6x);
router.get("/reports/summary/:_id", GkClientsController.module62);
router.get("/reports/detail", GkClientsController.module7x);
router.get("/reports/detail/:_id", GkClientsController.module72);

// Form Control
router.get("/controls", GkClientsController.lazyDataForFormControl);
router.get("/controls/list", GkClientsController.listDataForFormControl);
router.get("/datasource", GkClientsController.datasource);

router.get("/:_id", GkClientsController.module12);
router.get("/:_id/changes", GkClientsController.module19);

// POST
router.post("/entry", GkClientsController.module11);
router.post("/upload", GkClientsController.module21);
router.post("/download", GkClientsController.module22);
router.post("/upsert", GkClientsController.module23);
router.post("/status/disable", GkClientsController.module24);
router.post("/status/enable", GkClientsController.module25);
router.post("/status/mark", GkClientsController.module26);
router.post("/status/unmark", GkClientsController.module27);
router.post("/delete", GkClientsController.module28);
router.post("/dashboard/entry", GkClientsController.module51);
router.post("/reports/summary/entry", GkClientsController.module61);
router.post("/reports/detail/entry", GkClientsController.module71);

// PUT
router.put("/requests/:_id", GkClientsController.module33); // saveObjectOfRequest
router.put("/dashboard/:_id", GkClientsController.module53);
router.put("/reports/summary/:_id", GkClientsController.module63);
router.put("/reports/detail/:_id", GkClientsController.module73);
router.put("/:_id", GkClientsController.module13);

// PATCH
router.patch("/requests/:_id/post", GkClientsController.module42);
router.patch("/requests/:_id/revert", GkClientsController.module43);
router.patch("/:_id/disable", GkClientsController.module14);
router.patch("/:_id/enable", GkClientsController.module15);
router.patch("/:_id/mark", GkClientsController.module16);
router.patch("/:_id/unmark", GkClientsController.module17);

// DELETE
router.delete("/dashboard/:_id", GkClientsController.module58);
router.delete("/reports/summary/:_id", GkClientsController.module68);
router.delete("/reports/detail/:_id", GkClientsController.module78);
router.delete("/:_id", GkClientsController.module18);

// Action 1x - Individual
// router.get("/", GkClientsController.module1x);
// router.post("/entry", GkClientsController.module11);
// router.get("/:_id", GkClientsController.module12);
// router.put("/:_id", GkClientsController.module13);
// router.patch("/:_id/disable", GkClientsController.module14);
// router.patch("/:_id/enable", GkClientsController.module15);
// router.patch("/:_id/mark", GkClientsController.module16);
// router.patch("/:_id/unmark", GkClientsController.module17);
// router.delete("/:_id", GkClientsController.module18);
// router.get("/:_id/changes", GkClientsController.module19);

// Action 2x - Collective
// router.post("/upload", GkClientsController.module21);
// router.get("/download", GkClientsController.module22);
// router.post("/upsert", GkClientsController.module23);
// router.post("/status/disable", GkClientsController.module24);
// router.post("/status/enable", GkClientsController.module25);
// router.post("/status/mark", GkClientsController.module26);
// router.post("/status/unmark", GkClientsController.module27);
// router.post("/delete", GkClientsController.module28);
// router.get("/changes", GkClientsController.module29);

// Action 3x - Request
// router.get("/requests", GkClientsController.module3x); // TODO: Should have it or put it as the GkRequest level for singleton and just filter the module
// router.get("/requests/:_id", GkClientsController.module32); // findOrUpsertBlankObjectOfRequest
// router.put("/requests/:_id", GkClientsController.module33); // saveObjectOfRequest
// router.get("/requests/:_id/changes", GkClientsController.module39); // findOrUpsertBlankObjectOfRequest

// Actio 4x - Request Additional tasks of (Super User and Admin tasks)
// // router.post("/requests/:_id/mje", GkClientsController.module41);
// router.patch("/requests/:_id/post", GkClientsController.module42);
// router.patch("/requests/:_id/revert", GkClientsController.module43);
// // router.patch("/requests/:_id/approval", GkClientsController.module44);
// // router.patch("/requests/:_id/status", GkClientsController.module45);

// Action 5x - Dashboard
// router.get("/dashboard", GkClientsController.module5x);

//TODO : Further check for other below
// router.post("/dashboard/entry", GkClientsController.module51);
// router.get("/dashboard/:_id", GkClientsController.module52);
// router.put("/dashboard/:_id", GkClientsController.module53);
// router.delete("/dashboard/:_id", GkClientsController.module58);

// Action 6x - Summary Report
// router.get("/reports/summary", GkClientsController.module6x);
// router.post("/reports/summary/entry", GkClientsController.module61);
// router.get("/reports/summary/:_id", GkClientsController.module62);
// router.put("/reports/summary/:_id", GkClientsController.module63);
// router.delete("/reports/summary/:_id", GkClientsController.module68);

// Action 7x - Detai Report
// router.get("/reports/detail", GkClientsController.module7x);
// router.post("/reports/detail/entry", GkClientsController.module71);
// router.get("/reports/detail/:_id", GkClientsController.module72);
// router.put("/reports/detail/:_id", GkClientsController.module73);
// router.delete("/reports/detail/:_id", GkClientsController.module78);

// router.get("/api/lzMasterList", GkClientsController.lazyDataForFormControl);
// router.get("/api/masterList", GkClientsController.apiMasterList);

// router.get("/request/:_id", GkClientsController.findRequestById);

module.exports = router;
