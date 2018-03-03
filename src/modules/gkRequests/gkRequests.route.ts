console.log('   /...Loading [RequestRoutes]');

// External
var express = require("express");

// Internal
var GkRequestsController = require('./gkRequests.controller');
var router = express.Router();

// Routes
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last

// REQUEST - OPERATIONS
// Individial - CRUD
router.post("/entry", GkRequestsController.module11);
// router.post("/createChange", GkRequestsController.createChange);
router.get("/:_id", GkRequestsController.module12);
router.put("/:_id", GkRequestsController.module13);
router.get("/:_id/changes", GkRequestsController.module19);

// Collective - Master
router.get("/", GkRequestsController.module1x);

// Request Actions
router.put("/:_id/submit", GkRequestsController.submitRequest);
router.patch("/:_id/withdraw", GkRequestsController.withdrawRequest);
router.patch("/:_id/cancel", GkRequestsController.cancelRequest);
router.patch("/:_id/return", GkRequestsController.returnRequest);
router.patch("/:_id/reject", GkRequestsController.rejectRequest);
router.patch("/:_id/approve", GkRequestsController.approveRequest);
router.patch("/:_id/abort", GkRequestsController.abortRequest);

// Request Approval Flow
router.put("/:_id/approval/generateApprovalFlow", GkRequestsController.generateApprovalFlow);

// REQUEST - MANAGEMENT/ ACCOUNTING
// Management Data: Master & Transaction Data
router.patch("/:_id/post", GkRequestsController.postRequest);
router.patch("/:_id/revert", GkRequestsController.revertRequest);

// Accounting Data
router.post("/:_id/journal/create", GkRequestsController.createRequestJournal);
router.patch("/:_id/journal/post", GkRequestsController.postRequestJournal);
router.patch("/:_id/journal/revert", GkRequestsController.revertRequestJournal);

// REQUEST - ADMINISTRATION
router.post("/:_id/approval", GkRequestsController.moveRequestApproval);
router.post("/:_id/status", GkRequestsController.moveRequestStatus);

// Form Control
// router.get("/api/masterList", GkRequestsController.apiMasterList);
// router.get("/api/lzMasterList", GkRequestsController.apiLazyMasterList);

// router.get("/history", GkRequestsController.history);

module.exports = router;
