"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
Promise = require("bluebird");
var deep = require('deep-diff').diff;
var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");
var DBConnect = require('../../services/dbConnect.service');
var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');
var RequestApprovalSchema = require('./requestApproval.schema');
var RequestApprovalHistorySchema = require('./requestApproval.history.schema');
var StandardApprovers = require('./standardApprovers');
/*****************************************************************************************
 * REQUESTAPPROVAL CONTROLLER
 * @function findApprovalTypeByTcode
 *****************************************************************************************/
var RequestApprovalController = {
    getModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'RequestApproval', RequestApprovalSchema);
    }),
    getHistoryModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'RequestApprovalHistory', RequestApprovalHistorySchema);
    }),
    findStandardApprovalItems: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const standardApprovalItems = [
            // Management by function and by DOA
            {
                fx: 'fxDirectManager',
                desc: 'Direct Manager',
                type: 'one',
            },
            {
                fx: 'fxDepartmentHead',
                desc: 'Department Head',
                type: 'one',
            },
            {
                fx: 'fxDOAManager',
                desc: 'DOA Manager',
                type: 'one'
            },
            {
                fx: 'fxDOAManagerExcludeDirectManager',
                desc: 'DOA Manager (upper D. Manager)',
                type: 'one'
            },
            {
                fx: 'fxDOAManagers',
                desc: 'DOA Managers',
                type: 'many'
            },
            {
                fx: 'fxDOAManagersExcludeDirectManager',
                desc: 'DOA Managers (upper D. Manager)',
                type: 'many'
            },
            // Business Partner by function and by DOV
            {
                fx: 'fxFinanceBusinessPartner',
                desc: 'Finance Business Partner',
                type: 'one',
            },
            {
                fx: 'fxDOVFinanceBusinessPartner',
                desc: 'DOV Finance Business Partner',
                type: 'one',
            },
            {
                fx: 'fxDOVFinanceBusinessPartners',
                desc: 'DOV Finance Business Partners',
                type: 'many',
            },
            {
                fx: 'fxHRBusinessPartner',
                desc: 'HR Business Partner',
                type: 'one',
            },
            // Fixed position
            {
                fx: 'fxChiefAccountant',
                desc: 'Chief Accountant',
                type: 'one',
            },
            {
                fx: 'fxChiefFinanceOfficer',
                desc: 'Chief Finance Officer',
                type: 'one',
            },
            {
                fx: 'fxChiefComplianceOfficer',
                desc: 'Chief Compliance Officer',
                type: 'one',
            },
            {
                fx: 'fxChiefHumanCapitalOfficer',
                desc: 'Chief Human Capital Officer',
                type: 'one',
            },
            {
                fx: 'fxChiefMarketingOfficer',
                desc: 'Chief Marketing Officer',
                type: 'one',
            },
            {
                fx: 'fxChiefExecutiveOfficer',
                desc: 'Chief Executive Officer',
                type: 'one',
            },
            // Functionality
            {
                fx: 'fxSystemMasterData',
                desc: 'System MD Officer',
                type: 'one',
            },
            {
                fx: 'fxLegalEntityMasterData',
                desc: 'Legal Entity MD Officer',
                type: 'one',
            },
            {
                fx: 'fxVendorMasterData',
                desc: 'Vendor MD Officer',
                type: 'one',
            },
            {
                fx: 'fxCustomerMasterData',
                desc: 'Customer MD Officer',
                type: 'one',
            }
        ];
        const result = {
            message: '',
            data: standardApprovalItems,
            total: standardApprovalItems.length
        };
        return response.ok(res, result);
    }),
    findApprovalTypesByTcode: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.params._id) {
                const result = {
                    message: `${req.params._id} is required!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestApproval = yield RequestApprovalController.getModel(req, res);
                let requestApproval = yield RequestApproval.find({
                    tcode: req.params._id,
                }).select('_id desc items status1 status2');
                // console.log(requestApproval);
                if (!requestApproval) {
                    return response.fail_notFound(res);
                }
                else {
                    const result = {
                        message: '',
                        data: requestApproval,
                        total: requestApproval.length
                    };
                    return response.ok(res, result);
                }
            }
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
        // const sample = [
        //   { _id: 'A11',
        //     desc: 'GKCLN31 | Standard',
        //     items: [
        //       {
        //         fx: 'direct_manager',
        //         desc: 'Direct Manager',
        //         type: 'one',
        //       },
        //       {
        //         fx: 'cfo',
        //         desc: 'Chief Finance Officer',
        //         type: 'many',
        //       },
        //     ],
        //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
        //   }
        // ];
    }),
    createApprovalType: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tcode = 'gkcln92';
            req.body.status1 = 'Active';
            req.body.status2 = 'Unmarked';
            let RequestApproval = yield RequestApprovalController.getModel(req, res);
            let requestApproval = new RequestApproval(req.body);
            let approvalType = yield requestApproval.save();
            const trackParams = {
                multi: false,
                tcode: tcode,
                oldData: { _id: '' },
                newData: requestApproval.toObject()
            };
            let trackHistory = RequestApprovalController.trackHistory(req, res, trackParams);
            const result = {
                message: 'Creation completed!',
                data: approvalType._id
            };
            return response.ok_created(res, result);
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    updateApprovalType: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tcode = 'gkcln92';
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestApproval = yield RequestApprovalController.getModel(req, res);
                let approvalType = yield RequestApproval.findById(req.params._id);
                // console.log(approvalType);
                if (!approvalType) {
                    return response.fail_notFound(res);
                }
                else {
                    // console.log(req.body);
                    const oldApprovalType = JSON.stringify(approvalType);
                    approvalType.desc = req.body.desc;
                    approvalType.items = req.body.items;
                    let updatedApprovalType = yield approvalType.save();
                    if (updatedApprovalType) {
                        const trackParams = {
                            multi: false,
                            tcode: tcode,
                            oldData: JSON.parse(oldApprovalType),
                            newData: updatedApprovalType.toObject()
                        };
                        let trackHistory = RequestApprovalController.trackHistory(req, res, trackParams);
                        const result = {
                            data: updatedApprovalType,
                        };
                        return response.ok(res, result);
                    }
                    else {
                        throw new Error('Patch failed!');
                    }
                }
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    patchApprovalType: (req, res, patchType) => __awaiter(this, void 0, void 0, function* () {
        try {
            let tcode = 'gkcln92';
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestApproval = yield RequestApprovalController.getModel(req, res);
                let requestApproval = yield RequestApproval.findById(req.params._id);
                // console.log(requestApproval);
                if (!requestApproval) {
                    return response.fail_notFound(res);
                }
                else {
                    const oldClient = JSON.stringify(requestApproval);
                    switch (patchType) {
                        case 'disable':
                            tcode = 'gkcln14';
                            requestApproval.status1 = 'Inactive';
                            break;
                        case 'enable':
                            tcode = 'gkcln15';
                            requestApproval.status1 = 'Active';
                            break;
                        case 'mark':
                            tcode = 'gkcln16';
                            requestApproval.status2 = 'Marked';
                            break;
                        case 'unmark':
                            tcode = 'gkcln17';
                            requestApproval.status2 = 'Unmarked';
                            break;
                        default:
                            break;
                    }
                    let updatedRequestApproval = yield requestApproval.save();
                    if (updatedRequestApproval) {
                        const trackParams = {
                            multi: false,
                            tcode: tcode,
                            oldData: JSON.parse(oldClient),
                            newData: updatedRequestApproval.toObject()
                        };
                        let trackHistory = RequestApprovalController.trackHistory(req, res, trackParams);
                        const result = {
                            data: updatedRequestApproval,
                        };
                        return response.ok(res, result);
                    }
                    else {
                        throw new Error('Patch failed!');
                    }
                }
            }
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    }),
    disableApprovalType: (req, res) => __awaiter(this, void 0, void 0, function* () {
        RequestApprovalController.patchApprovalType(req, res, 'disable');
    }),
    enableApprovalType: (req, res) => __awaiter(this, void 0, void 0, function* () {
        RequestApprovalController.patchApprovalType(req, res, 'enable');
    }),
    markApprovalType: (req, res) => __awaiter(this, void 0, void 0, function* () {
        RequestApprovalController.patchApprovalType(req, res, 'mark');
    }),
    unmarkApprovalType: (req, res) => __awaiter(this, void 0, void 0, function* () {
        RequestApprovalController.patchApprovalType(req, res, 'unmark');
    }),
    deleteApprovalType: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tcode = 'gkcln92';
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestApproval = yield RequestApprovalController.getModel(req, res);
                let requestApproval = yield RequestApproval.findById(req.params._id);
                if (!requestApproval) {
                    return response.fail_notFound(res);
                }
                else {
                    if (requestApproval.status2 == 'Marked') {
                        let removedRequestApproval = yield requestApproval.remove();
                        if (removedRequestApproval) {
                            // console.log(removedClient);
                            const trackParams = {
                                multi: false,
                                tcode: tcode,
                                oldData: removedRequestApproval.toObject(),
                                newData: { _id: '' }
                            };
                            let trackHistory = RequestApprovalController.trackHistory(req, res, trackParams);
                            const result = {
                                data: removedRequestApproval,
                            };
                            return response.ok(res, result);
                        }
                        else {
                            throw new Error('Remove failed!');
                        }
                    }
                    else {
                        const result = {
                            message: 'Only marked document could be deleted!',
                            data: requestApproval,
                        };
                        return response.fail_preCondition(res, result);
                    }
                }
            }
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    }),
    viewChangeById: (req, res) => __awaiter(this, void 0, void 0, function* () {
    }),
    trackHistory: (req, res, trackParams) => __awaiter(this, void 0, void 0, function* () {
        try {
            let RequestApprovalHistory = yield RequestApprovalController.getHistoryModel(req, res);
            let history;
            const id = trackParams.newData._id || trackParams.oldData._id;
            delete trackParams.oldData._id;
            delete trackParams.newData._id;
            delete trackParams.oldData.created_at;
            delete trackParams.newData.created_at;
            const diff = deep(trackParams.oldData, trackParams.newData);
            // console.log(diff);
            history = {
                docId: id,
                username: req['mySession']._id,
                tcode: trackParams.tcode,
                diff: diff
            };
            // console.log(history);
            let requestApprovalHistory = new RequestApprovalHistory(history);
            return requestApprovalHistory.save();
        }
        catch (err) {
            console.log(err);
        }
    })
};
module.exports = RequestApprovalController;
