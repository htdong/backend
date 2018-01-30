console.log('   /...Loading [RequestFilesRoutes]');

// External
var express = require("express");

// Internal
var RequestFilesController = require('./requestFiles.controller');
var router = express.Router();

// Routes
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last

router.get("/download/:_id", RequestFilesController.downloadRequestFile);
router.get("/list/:_id", RequestFilesController.findFilesByRequestId);
router.get("/:_id", RequestFilesController.findFileById);

router.post("/upload/:_id", RequestFilesController.uploadRequestFiles); // Collective
router.post("/:_id", RequestFilesController.uploadRequestFile); // Individual

router.put("/:_id", RequestFilesController.renameRequestFile); // Individual

router.patch("/mark/:_id", RequestFilesController.markRequestFile);
router.patch("/unmark/:_id", RequestFilesController.unmarkRequestFile);

router.delete("/:_id", RequestFilesController.deleteRequestFile);

module.exports = router;
