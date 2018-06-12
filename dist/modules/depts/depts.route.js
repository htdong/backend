console.log('   /...Loading [DeptRoutes]');
// EXTERNAL
var express = require("express");
// INTERNAL
var DeptsController = require('./depts.controller');
var router = express.Router();
// ROUTES
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last
// GET
// router.get("/", DeptsController.module1x);
// router.get("/changes", DeptsController.module29);
// router.get("/requests/:_id", DeptsController.module32); // findOrUpsertBlankObjectOfRequest
// router.get("/requests/:_id/changes", DeptsController.module39); // findOrUpsertBlankObjectOfRequest
// router.get("/dashboard", DeptsController.module5x);
// router.get("/dashboard/:_id", DeptsController.module52);
// router.get("/reports/summary", DeptsController.module6x);
// router.get("/reports/summary/:_id", DeptsController.module62);
// router.get("/reports/detail", DeptsController.module7x);
// router.get("/reports/detail/:_id", DeptsController.module72);
// Form Control
// router.get("/controls", DeptsController.lazyDataForFormControl);
// router.get("/controls/list", DeptsController.listDataForFormControl);
// router.get("/datasource", DeptsController.datasource);
//
// router.get("/:_id", DeptsController.module12);
// router.get("/:_id/changes", DeptsController.module19);
// POST
// router.post("/entry", DeptsController.module11);
// router.post("/upload", DeptsController.module21);
// router.post("/download", DeptsController.module22);
// router.post("/upsert", DeptsController.module23);
// router.post("/status/disable", DeptsController.module24);
// router.post("/status/enable", DeptsController.module25);
// router.post("/status/mark", DeptsController.module26);
// router.post("/status/unmark", DeptsController.module27);
// router.post("/delete", DeptsController.module28);
// router.post("/dashboard/entry", DeptsController.module51);
// router.post("/reports/summary/entry", DeptsController.module61);
// router.post("/reports/detail/entry", DeptsController.module71);
// PUT
// router.put("/requests/:_id", DeptsController.module33); // saveObjectOfRequest
// router.put("/dashboard/:_id", DeptsController.module53);
// router.put("/reports/summary/:_id", DeptsController.module63);
// router.put("/reports/detail/:_id", DeptsController.module73);
// router.put("/:_id", DeptsController.module13);
// PATCH
// router.patch("/requests/:_id/post", DeptsController.module42);
// router.patch("/requests/:_id/revert", DeptsController.module43);
// router.patch("/:_id/disable", DeptsController.module14);
// router.patch("/:_id/enable", DeptsController.module15);
// router.patch("/:_id/mark", DeptsController.module16);
// router.patch("/:_id/unmark", DeptsController.module17);
// DELETE
// router.delete("/dashboard/:_id", DeptsController.module58);
// router.delete("/reports/summary/:_id", DeptsController.module68);
// router.delete("/reports/detail/:_id", DeptsController.module78);
// router.delete("/:_id", DeptsController.module18);
// Action 1x - Individual
// router.get("/", DeptsController.module1x);
// router.post("/entry", DeptsController.module11);
// router.get("/:_id", DeptsController.module12);
// router.put("/:_id", DeptsController.module13);
// router.patch("/:_id/disable", DeptsController.module14);
// router.patch("/:_id/enable", DeptsController.module15);
// router.patch("/:_id/mark", DeptsController.module16);
// router.patch("/:_id/unmark", DeptsController.module17);
// router.delete("/:_id", DeptsController.module18);
// router.get("/:_id/changes", DeptsController.module19);
// Action 2x - Collective
// router.post("/upload", DeptsController.module21);
// router.get("/download", DeptsController.module22);
// router.post("/upsert", DeptsController.module23);
// router.post("/status/disable", DeptsController.module24);
// router.post("/status/enable", DeptsController.module25);
// router.post("/status/mark", DeptsController.module26);
// router.post("/status/unmark", DeptsController.module27);
// router.post("/delete", DeptsController.module28);
// router.get("/changes", DeptsController.module29);
// Action 3x - Request
// router.get("/requests", DeptsController.module3x); // TODO: Should have it or put it as the GkRequest level for singleton and just filter the module
// router.get("/requests/:_id", DeptsController.module32); // findOrUpsertBlankObjectOfRequest
// router.put("/requests/:_id", DeptsController.module33); // saveObjectOfRequest
// router.get("/requests/:_id/changes", DeptsController.module39); // findOrUpsertBlankObjectOfRequest
// Actio 4x - Request Additional tasks of (Super User and Admin tasks)
// // router.post("/requests/:_id/mje", DeptsController.module41);
// router.patch("/requests/:_id/post", DeptsController.module42);
// router.patch("/requests/:_id/revert", DeptsController.module43);
// // router.patch("/requests/:_id/approval", DeptsController.module44);
// // router.patch("/requests/:_id/status", DeptsController.module45);
// Action 5x - Dashboard
// router.get("/dashboard", DeptsController.module5x);
//TODO : Further check for other below
// router.post("/dashboard/entry", DeptsController.module51);
// router.get("/dashboard/:_id", DeptsController.module52);
// router.put("/dashboard/:_id", DeptsController.module53);
// router.delete("/dashboard/:_id", DeptsController.module58);
// Action 6x - Summary Report
// router.get("/reports/summary", DeptsController.module6x);
// router.post("/reports/summary/entry", DeptsController.module61);
// router.get("/reports/summary/:_id", DeptsController.module62);
// router.put("/reports/summary/:_id", DeptsController.module63);
// router.delete("/reports/summary/:_id", DeptsController.module68);
// Action 7x - Detai Report
// router.get("/reports/detail", DeptsController.module7x);
// router.post("/reports/detail/entry", DeptsController.module71);
// router.get("/reports/detail/:_id", DeptsController.module72);
// router.put("/reports/detail/:_id", DeptsController.module73);
// router.delete("/reports/detail/:_id", DeptsController.module78);
// router.get("/api/lzMasterList", DeptsController.lazyDataForFormControl);
// router.get("/api/masterList", DeptsController.apiMasterList);
// router.get("/request/:_id", DeptsController.findRequestById);
module.exports = router;
