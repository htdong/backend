console.log('   /...Loading [RequestApprovalRoutes]');
var express = require("express");
var RequestApprovalController = require('./requestApproval.controller');
var router = express.Router();
// STANDARD APPROVAL ITEMS
router.get("/items", RequestApprovalController.findStandardApprovalItems);
// APPROVAL TYPES
router.get("/types/:_id", RequestApprovalController.findApprovalTypesByTcode);
router.post("/types", RequestApprovalController.createApprovalType);
router.put("/types/:_id", RequestApprovalController.updateApprovalType);
router.patch("/types/enable/:_id", RequestApprovalController.enableApprovalType);
router.patch("/types/disable/:_id", RequestApprovalController.disableApprovalType);
router.patch("/types/mark/:_id", RequestApprovalController.markApprovalType);
router.patch("/types/unmark/:_id", RequestApprovalController.unmarkApprovalType);
router.delete("/types/:_id", RequestApprovalController.deleteApprovalType);
module.exports = router;
