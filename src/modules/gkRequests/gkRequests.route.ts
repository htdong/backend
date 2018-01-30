console.log('   /...Loading [RequestRoutes]');

// External
var express = require("express");

// Internal
var GkRequestsController = require('./gkRequests.controller');
var router = express.Router();

// Routes
// IMPORTANT: Routes sequence is important as /:id could cover other get /xxx thus put at last
router.get("/masterListPagination", GkRequestsController.findMasterListPagination);
router.get("/viewChange/:_id", GkRequestsController.viewChangeById);
router.get("/history", GkRequestsController.history);
router.get("/api/masterList", GkRequestsController.apiMasterList);
router.get("/api/lzMasterList", GkRequestsController.apiLazyMasterList);
router.get("/:_id", GkRequestsController.findById);

router.post("/createNew", GkRequestsController.createNew);
// router.post("/createChange", GkRequestsController.createChange);

router.put("/submit/:_id", GkRequestsController.submit);
router.put("/:_id", GkRequestsController.update);
router.put("/generateApprovalFlow/:_id", GkRequestsController.generateApprovalFlow);

router.patch("/withdraw/:_id", GkRequestsController.withdraw);
router.patch("/cancel/:_id", GkRequestsController.cancel);
router.patch("/returnRequest/:_id", GkRequestsController.returnRequest);
router.patch("/reject/:_id", GkRequestsController.reject);
router.patch("/approve/:_id", GkRequestsController.approve);
router.patch("/abort/:_id", GkRequestsController.abort);

module.exports = router;
