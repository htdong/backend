"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('...Loading [UsersRoutes]');
const express = require("express");
const UsersController = require('./users.controller');
const router = express.Router();
// ROUTES
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last
// GET
// router.get("/", UsersController.module1x);
// router.get("/changes", GkClientsController.module29);
// router.get("/requests/:_id", GkClientsController.module32); // findOrUpsertBlankObjectOfRequest
// router.get("/requests/:_id/changes", GkClientsController.module39); // findOrUpsertBlankObjectOfRequest
// router.get("/dashboard", GkClientsController.module5x);
// router.get("/dashboard/:_id", GkClientsController.module52);
// router.get("/reports/summary", GkClientsController.module6x);
// router.get("/reports/summary/:_id", GkClientsController.module62);
// router.get("/reports/detail", GkClientsController.module7x);
// router.get("/reports/detail/:_id", GkClientsController.module72);
// Form Control
router.get("/controls", UsersController.lazyDataForFormControl);
router.get("/controls/list", UsersController.listDataForFormControl);
// router.get("/:_id", GkClientsController.module12);
// router.get("/:_id/changes", GkClientsController.module19);
// POST
// router.post("/entry", GkClientsController.module11);
// router.post("/upload", GkClientsController.module21);
// router.post("/download", GkClientsController.module22);
// router.post("/upsert", GkClientsController.module23);
// router.post("/status/disable", GkClientsController.module24);
// router.post("/status/enable", GkClientsController.module25);
// router.post("/status/mark", GkClientsController.module26);
// router.post("/status/unmark", GkClientsController.module27);
// router.post("/delete", GkClientsController.module28);
// router.post("/dashboard/entry", GkClientsController.module51);
// router.post("/reports/summary/entry", GkClientsController.module61);
// router.post("/reports/detail/entry", GkClientsController.module71);
router.post("/authenticate", UsersController.authenticate);
router.post("/register", UsersController.register);
router.post("/forgot", UsersController.forgot);
// PUT
// router.put("/requests/:_id", GkClientsController.module33); // saveObjectOfRequest
// router.put("/dashboard/:_id", GkClientsController.module53);
// router.put("/reports/summary/:_id", GkClientsController.module63);
// router.put("/reports/detail/:_id", GkClientsController.module73);
// router.put("/:_id", GkClientsController.module13);
// PATCH
// router.patch("/requests/:_id/post", GkClientsController.module42);
// router.patch("/requests/:_id/revert", GkClientsController.module43);
// router.patch("/:_id/disable", GkClientsController.module14);
// router.patch("/:_id/enable", GkClientsController.module15);
// router.patch("/:_id/mark", GkClientsController.module16);
// router.patch("/:_id/unmark", GkClientsController.module17);
// DELETE
// router.delete("/dashboard/:_id", GkClientsController.module58);
// router.delete("/reports/summary/:_id", GkClientsController.module68);
// router.delete("/reports/detail/:_id", GkClientsController.module78);
// router.delete("/:_id", GkClientsController.module18);
module.exports = router;
