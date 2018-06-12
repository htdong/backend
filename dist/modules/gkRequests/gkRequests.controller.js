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
var fs = require("fs");
var json2csv = require('json2csv');
var fastCSV = require('fast-csv');
var deep = require('deep-diff').diff;
var helperService = require('../../services/helper.service');
// import  { HelperService } from '../../services/helper.service';
var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");
var DBConnect = require('../../services/dbConnect.service');
var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');
var security = require('../../services/permission.service');
var GkRequestSchema = require('./gkRequest.schema');
var GkRequestHistorySchema = require('./gkRequest.history.schema');
var StandardApprovers = require('../requestApproval/standardApprovers');
var notificationsController = require('../notification/notifications.controller');
var requestHistoriesController = require('../requestHistories/requestHistories.controller');
var GkRequestsController = {
    /**
    * @function module11
    * Create new document for (request) collection
    * Corresonding tcode = module + 11
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 201
    * - 401
    * - 500
    */
    module11: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            let requestHeader = req.body;
            // Preparing request data
            delete requestHeader._id;
            requestHeader.status = 'Draft';
            requestHeader.owner = [req['mySession'].username];
            if (!requestHeader.owner.includes(requestHeader.requestor.username)) {
                requestHeader.owner.push(requestHeader.requestor.username);
            }
            /**
             * SECURITY CHECK
             * - Logged user must have document tcode (req.body.tcode) in (req['mySession'].tcodes)
             * - Logged user (req['mySession'].username) must be in owner list (req.body.owner)
             *   User (req.body.owner) is used for test as (requestHeader) default will include logged user
             */
            if (!(security.hasTcode(req, req.body.tcode) && security.isOwner(req.body.owner, req))) {
                return response.fail_forbidden(res);
            }
            else {
                // Create new request document
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = new GkRequest(requestHeader);
                let createdRequest = yield gkRequest.save();
                // TODO: Save the first history
                const historyObject = {
                    "type": "comment",
                    "docId": createdRequest._id,
                    "header": "<a href='#'>" + req['mySession'].username + "</a> created new request!",
                    "body": "",
                    "footer": "",
                };
                let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                helperService.log(createdHistory);
                // Return reult
                const result = {
                    message: 'Creation completed!',
                    data: createdRequest._id
                };
                return response.ok_created(res, result);
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    /**
    * @function module12
    * Retrieve a document from (request) collection
    * Corresonding tcode = module + 12
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 404 (Not Found)
    * - 500
    */
    module12: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let client = yield GkRequest.findById(req.params._id);
                // helperService.log(client);
                if (!client) {
                    return response.fail_notFound(res);
                }
                else {
                    const result = {
                        message: '',
                        data: client,
                        total: 1
                    };
                    return response.ok(res, result);
                }
            }
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function module13
    * Update a document in (request) collection
    * Corresonding tcode = module + 13
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 401
    * - 404 (Not Found)
    * - 500
    */
    module13: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                // Retrieve document
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    let requestHeader = req.body;
                    // const oldRequest = JSON.stringify(gkRequest);
                    requestHeader.owner = [req['mySession'].username];
                    if (!requestHeader.owner.includes(requestHeader.requestor.username)) {
                        requestHeader.owner.push(requestHeader.requestor.username);
                    }
                    /**
                     * SECURITY CHECK
                     * - Lsogged user must have document tcode (req.body.tcode) in (req['mySession'].tcodes)
                     * - Logged user (req['mySession'].username) must be in owner list (req.body.owner)
                     *   User (req.body.owner) is used for test as (requestHeader) default will include logged user
                     */
                    if (!(security.hasTcode(req, req.body.tcode) && security.isOwner(req.body.owner, req))) {
                        return response.fail_forbidden(res);
                    }
                    else {
                        const oldData = Object.assign({}, gkRequest._doc);
                        // console.log('Old Data: ', oldData);
                        // Update request document
                        gkRequest.desc = requestHeader.desc;
                        gkRequest.remark = requestHeader.remark;
                        gkRequest.status = requestHeader.status;
                        gkRequest.step = requestHeader.step;
                        gkRequest.approval_type = requestHeader.approval_type;
                        gkRequest.requestor = requestHeader.requestor;
                        gkRequest.owner = requestHeader.owner;
                        let updatedRequest = yield gkRequest.save();
                        // helperService.log(updatedRequest);
                        const diff = deep(oldData, updatedRequest._doc);
                        helperService.log(diff);
                        if (updatedRequest) {
                            // TODO: Save the first history
                            const historyObject = {
                                "type": "comment",
                                "docId": updatedRequest._id,
                                "header": "<a href='#'>" + req['mySession'].username + "</a> update request!",
                                "body": "Changes: " + JSON.stringify(diff),
                                "footer": "",
                            };
                            let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                            helperService.log(createdHistory);
                            const result = {
                                data: updatedRequest,
                            };
                            return response.ok(res, result);
                        }
                        else {
                            throw new Error('Patch failed!');
                        }
                    }
                }
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    /**
    * @function module19
    * View changes history of a document in (request) collection
    * Corresonding tcode = module + 19
    * LAZY FUNCTION
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 500
    */
    module19: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let GkRequestHistory = yield GkRequestsController.getHistoryModel(req, res);
                let params = req.query;
                let query = {
                    $and: [
                        { docId: { '$regex': req.params._id, '$options': 'i' } },
                    ]
                };
                let options = {
                    select: 'created_at docId username tcode diff',
                    sort: { created_at: -1 },
                    lean: false,
                    offset: parseInt(params.first),
                    limit: parseInt(params.rows)
                };
                let history = yield GkRequestHistory.paginate(query, options);
                const result = {
                    data: history.docs,
                    total: history.total,
                };
                return response.ok_pagination(res, result);
            }
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function module1x
    * List of document in (request) collection
    * Corresonding tcode = module + 1x
    * LAZY FUNCTION
    *
    * @param {express.Request} req
    * - @param {string} filter
    * - @param {object} sort
    * - @param {number} first
    * - @param {number} rows
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 500
    */
    module1x: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            let GkRequest = yield GkRequestsController.getModel(req, res);
            let params = req.query;
            // helperService.log(params);
            // helperService.log(req.headers.usr);
            const username = req['mySession'].username;
            let query = {};
            switch (params.tray) {
                case 'inbox':
                    query = {
                        $and: [
                            { desc: { '$regex': params.filter, '$options': 'i' } },
                            { 'pic.username': username }
                        ]
                    };
                    break;
                case 'outbox':
                    query = {
                        $and: [
                            { desc: { '$regex': params.filter, '$options': 'i' } },
                            { approved: username }
                        ]
                    };
                    break;
                case 'draft':
                    query = {
                        $and: [
                            { desc: { '$regex': params.filter, '$options': 'i' } },
                            { owner: username },
                            { status: 'Draft' }
                        ]
                    };
                    break;
                case 'inprogress':
                    query = {
                        $and: [
                            { desc: { '$regex': params.filter, '$options': 'i' } },
                            { owner: username },
                            { status: { $in: ['In progress', 'P. Submit', 'P. Withdraw', 'P. Cancel', 'P. Abort'] } }
                        ]
                    };
                    break;
                case 'completed':
                    query = {
                        $and: [
                            { desc: { '$regex': params.filter, '$options': 'i' } },
                            { owner: username },
                            { status: { $in: ['Cancelled', 'Rejected', 'Approved', 'Aborted', 'Posted'] } }
                        ]
                    };
                    break;
                case 'module':
                    query = {
                        $and: [
                            { desc: { '$regex': params.filter, '$options': 'i' } },
                            { owner: username },
                            { tcode: { '$regex': params.prefix, '$options': 'i' } }
                        ]
                    };
                    break;
                default:
                    return response.fail_preCondition(res, {});
            }
            // helperService.log(query);
            // TODO: Return data that fit to TRAY only, for better performance
            let options = {
                select: '_id tcode desc status requestor owner step pic approved created_at updated_at',
                sort: JSON.parse(params.sort),
                lean: false,
                offset: parseInt(params.first),
                limit: parseInt(params.rows)
            };
            let clients = yield GkRequest.paginate(query, options);
            const result = {
                data: clients.docs,
                total: clients.total,
            };
            return response.ok_pagination(res, result);
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * REQUEST ACTIONS
    * @function submitRequest
    * @function withdrawRequest
    * @function cancelRequest
    * @function returnRequest
    * @function rejectRequest
    * @function approveRequest
    * @function abortRequest
    */
    /**
    * @function submitRequest
    * Submit the request by sender or requestor
    * Status to be changed to: P. Submit or In progress
    *
    * Logic:
    * - If approval_type is yet selected then cancel submission (412)
    * - If approval flow is not available then generate approval flow
    */
    submitRequest: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    /**
                     * SECURITY CHECK
                     * - Logged user must have document tcode (req.body.tcode) in (req['mySession'].tcodes)
                     * - Logged user (req['mySession'].username) must be in owner list (req.body.owner)
                     *   User (req.body.owner) is used for test as (requestHeader) default will include logged user
                     */
                    if (!(security.hasTcode(req, req.body.tcode) && security.isOwner(req.body.owner, req))) {
                        return response.fail_forbidden(res);
                    }
                    else {
                        /**
                        * Check if approval_type is determinable
                        */
                        if (!gkRequest.approval_type) {
                            const msg = {
                                message: 'Approval Type is not defined!',
                                data: []
                            };
                            return response.fail_preCondition(res, msg);
                        }
                        else {
                            let requestHeader = req.body;
                            /**
                            * Check real requestor to define: sender, requestor and owner roles
                            */
                            requestHeader.owner = [req['mySession'].username];
                            if (!requestHeader.owner.includes(requestHeader.requestor.username)) {
                                requestHeader.owner.push(requestHeader.requestor.username);
                            }
                            /**
                            * Check control over sender for split conditions
                            */
                            const controlSender = true;
                            /**
                            * Check if approval flow is correctly generated
                            */
                            let approvalFlow = yield GkRequestsController.stimulateApprovalFlow(req, res, gkRequest);
                            let isInclusive = yield GkRequestsController.checkApprovalFLow(gkRequest.approval, approvalFlow);
                            console.log('Comparison: ', isInclusive);
                            if ((!gkRequest.approval) || (!isInclusive)) {
                                gkRequest.approval = approvalFlow;
                                gkRequest.markModified('approval'); // IMPORTANT: To notify mongo dataset change
                            }
                            console.log('Approval: ', gkRequest.approval);
                            /**
                            * Submission branches
                            * 1. In progress
                            * 2. P. Submit
                            */
                            if (req['mySession'].username === gkRequest.requestor.username) {
                                gkRequest.status = 'In progress';
                                /**
                                * Initialize approver tracker
                                * approved: []
                                * pic: first approver
                                * planned: first approver
                                * next: from second to end array
                                */
                                gkRequest.approved = [];
                                gkRequest.pic = {
                                    username: gkRequest.approval[0].username,
                                    fullname: gkRequest.approval[0].fullname,
                                };
                                gkRequest.step = gkRequest.approval[0].step;
                                const approverLen = gkRequest.approval.length;
                                if (approverLen > 1) {
                                    gkRequest.planned = gkRequest.approval[1].username;
                                }
                                gkRequest.next = [];
                                for (let i = 1; i < approverLen; i++) {
                                    gkRequest.next.push(gkRequest.approval[i].username);
                                }
                            }
                            else {
                                gkRequest.status = 'P. Submit';
                                /**
                                * Initialize approver tracker
                                * approved: []
                                * pic: requestor
                                * planned:
                                * next: []
                                */
                                gkRequest.approved = [];
                                gkRequest.pic = {
                                    username: gkRequest.requestor.username,
                                    fullname: gkRequest.requestor.fullname,
                                };
                                gkRequest.step = 'Requestor validation';
                                gkRequest.planned = gkRequest.approval[0].username;
                                const approverLen = gkRequest.approval.length;
                                gkRequest.next = [];
                                for (let i = 1; i < approverLen; i++) {
                                    gkRequest.next.push(gkRequest.approval[i].username);
                                }
                            }
                            // Update request document
                            gkRequest.desc = requestHeader.desc;
                            gkRequest.remark = requestHeader.remark;
                            gkRequest.requestor = requestHeader.requestor;
                            gkRequest.owner = requestHeader.owner;
                            // helperService.log(gkRequest);
                            let updatedRequest = yield gkRequest.save();
                            if (updatedRequest) {
                                // TODO: Save the first history
                                const historyObject = {
                                    "type": "comment",
                                    "docId": updatedRequest._id,
                                    "header": "<a href='#'>" + req['mySession'].username + "</a> submit request!",
                                    "body": "Nothing change or change to approval list",
                                    "footer": "",
                                };
                                let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                                helperService.log(createdHistory);
                                const result = {
                                    data: updatedRequest,
                                };
                                return response.ok(res, result);
                            }
                            else {
                                throw new Error('Patch failed!');
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    withdrawRequest: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                // Retrieve document
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    /**
                     * SECURITY CHECK
                     * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                     * - Logged user (req['mySession'].username) must be in owner list (gkRequest.owner)
                     */
                    if (!(security.hasTcode(req, gkRequest.tcode) && security.isOwner(gkRequest.owner, req))) {
                        return response.fail_forbidden(res);
                    }
                    else {
                        // Check role of logged user to split condition
                        if (req['mySession'].username === gkRequest.requestor.username) {
                            gkRequest.status = 'Draft';
                            gkRequest.step = '';
                            gkRequest.approved = [];
                            gkRequest.pic = {};
                            gkRequest.next = [];
                            gkRequest.planned = '';
                        }
                        else {
                            gkRequest.status = 'P. Withdraw';
                            gkRequest.pic = gkRequest.requestor;
                        }
                        // Update request document
                        let updatedRequest = yield gkRequest.save();
                        if (updatedRequest) {
                            // TODO: Save the first history
                            const historyObject = {
                                "type": "comment",
                                "docId": updatedRequest._id,
                                "header": "<a href='#'>" + req['mySession'].username + "</a> withdraw the request!",
                                "body": "",
                                "footer": "",
                            };
                            let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                            helperService.log(createdHistory);
                            const result = {
                                data: updatedRequest,
                            };
                            return response.ok(res, result);
                        }
                        else {
                            throw new Error('Patch failed!');
                        }
                    }
                }
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    cancelRequest: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    /**
                     * SECURITY CHECK
                     * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                     * - Logged user (req['mySession'].username) must be in owner list (gkRequest.owner)
                     */
                    if (!(security.hasTcode(req, gkRequest.tcode) && security.isOwner(gkRequest.owner, req))) {
                        return response.fail_forbidden(res);
                    }
                    else {
                        // Check role of logged user to split condition
                        if (req['mySession'].username === gkRequest.requestor.username) {
                            gkRequest.status = 'Cancelled';
                        }
                        else {
                            gkRequest.status = 'P. Cancel';
                        }
                        // Update request document
                        let updatedRequest = yield gkRequest.save();
                        if (updatedRequest) {
                            // TODO: Save the first history
                            const historyObject = {
                                "type": "comment",
                                "docId": updatedRequest._id,
                                "header": "<a href='#'>" + req['mySession'].username + "</a> cancel the request!",
                                "body": "",
                                "footer": "",
                            };
                            let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                            helperService.log(createdHistory);
                            const result = {
                                data: updatedRequest,
                            };
                            return response.ok(res, result);
                        }
                        else {
                            throw new Error('Patch failed!');
                        }
                    }
                }
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    returnRequest: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                // Retrieve document
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                helperService.log(gkRequest);
                const tcode = gkRequest.tcode;
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    // Check status of request document to split condition
                    switch (gkRequest.status) {
                        case 'P. Submit':
                            /**
                             * SECURITY CHECK
                             * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                             * - Logged user (req['mySession'].username)
                             * + must be the requestor (gkRequest.requestor)
                             * + must be in owner list (gkRequest.owner)
                             * + must be the PIC (gkRequest.pic)
                             */
                            if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username))) {
                                return response.fail_forbidden(res);
                            }
                            else {
                                // Reset to Draft
                                gkRequest.status = 'Draft';
                                gkRequest.approved = [];
                                gkRequest.step = '';
                                gkRequest.pic = {};
                                gkRequest.next = [];
                                gkRequest.planned = '';
                            }
                            break;
                        case 'In progress':
                            /**
                             * SECURITY CHECK
                             * - Logged user must be PIC
                             */
                            if (!security.isPIC(req, gkRequest.pic.username)) {
                                return response.fail_forbidden(res);
                            }
                            else {
                                // Reset to Draft
                                gkRequest.status = 'Draft';
                                gkRequest.step = '';
                                gkRequest.approved = [];
                                gkRequest.pic = {};
                                gkRequest.next = [];
                                gkRequest.planned = '';
                            }
                            break;
                        case 'P. Withdraw':
                        case 'P. Cancel':
                            /**
                             * SECURITY CHECK
                             * SECURITY CHECK
                             * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                             * - Logged user (req['mySession'].username)
                             * + must be the requestor (gkRequest.requestor)
                             * + must be in owner list (gkRequest.owner)
                             * + must be the PIC (gkRequest.pic)
                             */
                            if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username))) {
                                return response.fail_forbidden(res);
                            }
                            else {
                                gkRequest.status = 'In progress';
                                // Reinforce the approval process
                                // Example only
                                gkRequest.pic = {
                                    username: gkRequest.planned,
                                    fullname: gkRequest.planned,
                                };
                            }
                            break;
                        case 'P. Abort':
                            /**
                             * SECURITY CHECK
                             * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                             * - Logged user (req['mySession'].username)
                             * + must be the requestor (gkRequest.requestor)
                             * + must be in owner list (gkRequest.owner)
                             * + must be the PIC (gkRequest.pic)
                             */
                            if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username))) {
                                return response.fail_forbidden(res);
                            }
                            else {
                                gkRequest.status = 'Approved';
                                gkRequest.pic = {};
                            }
                            break;
                        default:
                            return response.fail_badRequest(res);
                    }
                    // Update request document
                    let updatedRequest = yield gkRequest.save();
                    if (updatedRequest) {
                        // TODO: Save the first history
                        const historyObject = {
                            "type": "comment",
                            "docId": updatedRequest._id,
                            "header": "<a href='#'>" + req['mySession'].username + "</a> return the request!",
                            "body": "",
                            "footer": "",
                        };
                        let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                        helperService.log(createdHistory);
                        const result = {
                            data: updatedRequest,
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
    rejectRequest: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    /**
                     * SECURITY CHECK
                     * - Logged user must be PIC
                     */
                    if (!security.isPIC(req, gkRequest.pic.username)) {
                        return response.fail_forbidden(res);
                    }
                    else {
                        // Update request document
                        gkRequest.status = 'Rejected';
                        gkRequest.approved.push(gkRequest.pic.username);
                        gkRequest.pic = {};
                        gkRequest.planned = '';
                        let updatedRequest = yield gkRequest.save();
                        if (updatedRequest) {
                            // TODO: Save the first history
                            const historyObject = {
                                "type": "comment",
                                "docId": updatedRequest._id,
                                "header": "<a href='#'>" + req['mySession'].username + "</a> reject the request!",
                                "body": "",
                                "footer": "",
                            };
                            let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                            helperService.log(createdHistory);
                            const result = {
                                data: updatedRequest,
                            };
                            return response.ok(res, result);
                        }
                        else {
                            throw new Error('Patch failed!');
                        }
                    }
                }
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    approveRequest: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                // Retrieve document
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                const tcode = gkRequest.tcode;
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    // Check status of request document to split condition
                    switch (gkRequest.status) {
                        case 'P. Submit':
                            /**
                             * SECURITY CHECK
                             * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                             * - Logged user (req['mySession'].username)
                             * + must be the requestor (gkRequest.requestor)
                             * + must be in owner list (gkRequest.owner)
                             * + must be the PIC (gkRequest.pic)
                             */
                            if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username))) {
                                return response.fail_forbidden(res);
                            }
                            else {
                                if (GkRequestsController.isLastApprover(gkRequest)) {
                                    gkRequest.status = 'Approved';
                                    // gkRequest.approved.push(gkRequest.pic.username);
                                    gkRequest.step = '';
                                    gkRequest.pic = {};
                                }
                                else {
                                    gkRequest.status = 'In progress';
                                    // gkRequest.approved.push(gkRequest.pic.username);
                                    gkRequest.pic = {
                                        username: gkRequest.planned,
                                        fullname: gkRequest.planned
                                    };
                                    if (gkRequest.next.length < 1) {
                                        gkRequest.planned = '';
                                    }
                                    else {
                                        gkRequest.planned = gkRequest.next[0];
                                        gkRequest.next.splice(0, 1);
                                    }
                                }
                            }
                            break;
                        case 'In progress':
                            /**
                             * SECURITY CHECK
                             * - Logged user must be PIC
                             */
                            if (!security.isPIC(req, gkRequest.pic.username)) {
                                return response.fail_forbidden(res);
                            }
                            else {
                                if (GkRequestsController.isLastApprover(gkRequest)) {
                                    gkRequest.status = 'Approved';
                                    gkRequest.approved.push(gkRequest.pic.username);
                                    gkRequest.step = '';
                                    gkRequest.pic = {};
                                    gkRequest.planned = '';
                                    const approvalLen = gkRequest.approval.length;
                                    gkRequest.approval[approvalLen - 1].decision = 'Approved';
                                    gkRequest.approval[approvalLen - 1].decided_at = Date.now();
                                    gkRequest.markModified('approval'); // IMPORTANT: To notify mongo dataset change
                                }
                                else {
                                    gkRequest.status = 'In progress';
                                    gkRequest.approved.push(gkRequest.pic.username);
                                    gkRequest.step = gkRequest.planned;
                                    gkRequest.pic = {
                                        username: gkRequest.planned,
                                        fullname: gkRequest.planned
                                    };
                                    if (gkRequest.next.length < 1) {
                                        gkRequest.planned = '';
                                    }
                                    else {
                                        gkRequest.planned = gkRequest.next[0];
                                        gkRequest.next.splice(0, 1);
                                    }
                                    const approvalLen = gkRequest.approval.length;
                                    for (let i = 0; i < approvalLen; i++) {
                                        console.log(gkRequest.approval[i].username, req['mySession'].username);
                                        if (gkRequest.approval[i].username === req['mySession'].username) {
                                            gkRequest.approval[i].decision = 'Approved';
                                            gkRequest.approval[i].decided_at = Date.now();
                                            gkRequest.markModified('approval'); // IMPORTANT: To notify mongo dataset change
                                            break;
                                        }
                                    }
                                }
                            }
                            break;
                        case 'P. Withdraw':
                            /**
                             * SECURITY CHECK
                             * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                             * - Logged user (req['mySession'].username)
                             * + must be the requestor (gkRequest.requestor)
                             * + must be in owner list (gkRequest.owner)
                             * + must be the PIC (gkRequest.pic)
                             */
                            if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username))) {
                                return response.fail_forbidden(res);
                            }
                            else {
                                gkRequest.status = 'Draft';
                                gkRequest.pic = {
                                    username: gkRequest.planned,
                                    fullname: gkRequest.planned
                                };
                            }
                            break;
                        case 'P. Cancel':
                            /**
                             * SECURITY CHECK
                             * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                             * - Logged user (req['mySession'].username)
                             * + must be the requestor (gkRequest.requestor)
                             * + must be in owner list (gkRequest.owner)
                             * + must be the PIC (gkRequest.pic)
                             */
                            if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username))) {
                                return response.fail_forbidden(res);
                            }
                            else {
                                gkRequest.status = 'Cancelled';
                                gkRequest.pic = {
                                    username: gkRequest.planned,
                                    fullname: gkRequest.planned
                                };
                            }
                            break;
                        case 'P. Abort':
                            /**
                             * SECURITY CHECK
                             * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                             * - Logged user (req['mySession'].username)
                             * + must be the requestor (gkRequest.requestor)
                             * + must be in owner list (gkRequest.owner)
                             * + must be the PIC (gkRequest.pic)
                             */
                            if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username))) {
                                return response.fail_forbidden(res);
                            }
                            else {
                                gkRequest.status = 'Aborted';
                                gkRequest.pic = {};
                            }
                            break;
                        default:
                            return response.fail_badRequest(res);
                    }
                    // Update request document
                    let updatedRequest = yield gkRequest.save();
                    helperService.log(updatedRequest);
                    if (updatedRequest) {
                        // TODO: Save the first history
                        const historyObject = {
                            "type": "comment",
                            "docId": updatedRequest._id,
                            "header": "<a href='#'>" + req['mySession'].username + "</a> approve the request!",
                            "body": "Including invitation or not",
                            "footer": "",
                        };
                        let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                        helperService.log(createdHistory);
                        const result = {
                            data: updatedRequest,
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
    abortRequest: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    /**
                     * SECURITY CHECK
                     * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
                     * - Logged user (req['mySession'].username) must be in owner list (gkRequest.owner)
                     */
                    if (!(security.hasTcode(req, gkRequest.tcode) && security.isOwner(gkRequest.owner, req))) {
                        return response.fail_forbidden(res);
                    }
                    else {
                        // Check role of logged user to split condition
                        if (req['mySession'].username === gkRequest.requestor.username) {
                            gkRequest.status = 'Aborted';
                        }
                        else {
                            gkRequest.status = 'P. Abort';
                        }
                        // Update request document
                        let updatedRequest = yield gkRequest.save();
                        if (updatedRequest) {
                            // TODO: Save the first history
                            const historyObject = {
                                "type": "comment",
                                "docId": updatedRequest._id,
                                "header": "<a href='#'>" + req['mySession'].username + "</a> abort the request!",
                                "body": "",
                                "footer": "",
                            };
                            let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                            helperService.log(createdHistory);
                            const result = {
                                data: updatedRequest,
                            };
                            return response.ok(res, result);
                        }
                        else {
                            throw new Error('Patch failed!');
                        }
                    }
                }
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    /**
    * @function postRequest
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 404 (Not Found)
    * - 500
    */
    postRequest: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            return response.ok_pagination(res, {});
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function revertRequest
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 404 (Not Found)
    * - 500
    */
    revertRequest: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            return response.ok_pagination(res, {});
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function createRequestJournal
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 404 (Not Found)
    * - 500
    */
    createRequestJournal: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            return response.ok_pagination(res, {});
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function postRequestJournal
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 404 (Not Found)
    * - 500
    */
    postRequestJournal: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            return response.ok_pagination(res, {});
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function revertRequestJournal
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 404 (Not Found)
    * - 500
    */
    revertRequestJournal: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            return response.ok_pagination(res, {});
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function moveRequestApproval
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 404 (Not Found)
    * - 500
    */
    moveRequestApproval: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            return response.ok_pagination(res, {});
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function moveRequestStatus
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 404 (Not Found)
    * - 500
    */
    moveRequestStatus: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            return response.ok_pagination(res, {});
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * REQUEST APPROVAL FLOW
    */
    generateApprovalFlow: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                // Retrieve document
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    // /**
                    //  * SECURITY CHECK
                    //  * - Logged user must have document tcode (req.body.tcode) in (req['mySession'].tcodes)
                    //  * - Logged user (req['mySession'].username) must be in owner list (req.body.owner)
                    //  *   User (req.body.owner) is used for test as (requestHeader) default will include logged user
                    //  */
                    // if (!(security.hasTcode(req, req.body.tcode) && security.isOwner(req.body.owner, req))) {
                    //   return response.fail_forbidden(res);
                    // }
                    if ((gkRequest.status === 'Draft') && (gkRequest.approval_type)) {
                        const approvalParams = {
                            requestor: req['mySession'].username,
                            department: req['mySession'].department,
                            directmanager: req['mySession'].directmanager,
                            request_amount: 10000000,
                        };
                        let requestApprovalFunction = yield GkRequestsController.getAprrovalFunction(req, res, gkRequest.approval_type.items, approvalParams);
                        console.log('request Approval Function: ', requestApprovalFunction.length);
                        const arrLen = requestApprovalFunction.length;
                        let requestApprovalFlow = [];
                        // SYNC
                        // for (let i=0; i<arrLen; i++) {
                        //   requestApprovalFlow.push(await requestApprovalFunction[i].call(this, req, res, approvalParams));
                        // }
                        // ASYNC
                        yield Promise.all(requestApprovalFunction.map(callback => callback.call(this, req, res, approvalParams))).then((values) => {
                            // helperService.log(values);
                            requestApprovalFlow = GkRequestsController.concatArrayOfObjects(values);
                        });
                        console.log('Final Results');
                        helperService.log(requestApprovalFlow);
                        // DEBUG
                        // requestApprovalFlow = [
                        //   {
                        //     type: 'm',
                        //     username: 'financebp',
                        //     fullname: 'Finance BP',
                        //     step: 'Finance BP',
                        //     comment: '',
                        //     decision: '',
                        //     decided_at: ''
                        //   }];
                        gkRequest.approval = requestApprovalFlow;
                        let updatedGkRequest = yield gkRequest.save();
                        if (updatedGkRequest) {
                            // TODO: Save the first history
                            const historyObject = {
                                "type": "comment",
                                "docId": updatedGkRequest._id,
                                "header": "<a href='#'>" + req['mySession'].username + "</a> generate approval flow!",
                                "body": "Approval Type: " + updatedGkRequest.approval_type.desc,
                                "footer": "",
                            };
                            let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                            // helperService.log(createdHistory);
                            const result = {
                                data: updatedGkRequest['approval'],
                            };
                            return response.ok(res, result);
                        }
                        else {
                            throw new Error('Patch failed! May be due to wrong status or approval type is undefined!');
                        }
                    }
                }
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    stimulateApprovalFlow: (req, res, gkRequest) => __awaiter(this, void 0, void 0, function* () {
        try {
            const approvalParams = {
                requestor: req['mySession'].username,
                department: req['mySession'].department,
                directmanager: req['mySession'].directmanager,
                request_amount: 10000000,
            };
            let requestApprovalFunction = yield GkRequestsController.getAprrovalFunction(req, res, gkRequest.approval_type.items, approvalParams);
            console.log('request Approval Function: ', requestApprovalFunction.length);
            const arrLen = requestApprovalFunction.length;
            let requestApprovalFlow = [];
            // SYNC
            // for (let i=0; i<arrLen; i++) {
            //   requestApprovalFlow.push(await requestApprovalFunction[i].call(this, req, res, approvalParams));
            // }
            // ASYNC
            yield Promise.all(requestApprovalFunction.map(callback => callback.call(this, req, res, approvalParams))).then((values) => {
                // helperService.log(values);
                requestApprovalFlow = GkRequestsController.concatArrayOfObjects(values);
            });
            console.log('Final Results');
            helperService.log(requestApprovalFlow);
            return Promise.resolve(requestApprovalFlow);
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    getAprrovalFunction: (req, res, approvalItems, approvalParams) => __awaiter(this, void 0, void 0, function* () {
        let standardApprovers = {
            fxDirectManager: StandardApprovers.fxDirectManager,
            fxDepartmentHead: StandardApprovers.fxDepartmentHead,
            fxDOAManager: StandardApprovers.fxDOAManager,
            fxDOAManagerExcludeDirectManager: StandardApprovers.fxDOAManagerExcludeDirectManager,
            fxDOAManagers: StandardApprovers.fxDOAManagers,
            fxDOAManagersExcludeDirectManager: StandardApprovers.fxDOAManagersExcludeDirectManager,
            fxFinanceBusinessPartner: StandardApprovers.fxFinanceBusinessPartner,
            fxDOVFinanceBusinessPartner: StandardApprovers.fxDOVFinanceBusinessPartner,
            fxDOVFinanceBusinessPartners: StandardApprovers.fxDOVFinanceBusinessPartners,
            fxHRBusinessPartner: StandardApprovers.fxHRBusinessPartner,
            fxChiefAccountant: StandardApprovers.fxChiefAccountant,
            fxChiefFinanceOfficer: StandardApprovers.fxChiefFinanceOfficer,
            fxChiefComplianceOfficer: StandardApprovers.fxChiefComplianceOfficer,
            fxChiefHumanCapitalOfficer: StandardApprovers.fxChiefHumanCapitalOfficer,
            fxChiefMarketingOfficer: StandardApprovers.fxChiefMarketingOfficer,
            fxChiefExecutiveOfficer: StandardApprovers.fxChiefExecutiveOfficer,
            fxSystemMasterData: StandardApprovers.fxSystemMasterData,
            fxLegalEntityMasterData: StandardApprovers.fxLegalEntityMasterData,
            fxVendorMasterData: StandardApprovers.fxVendorMasterData,
            fxCustomerMasterData: StandardApprovers.fxCustomerMasterData,
        };
        let approvalFunction = [];
        let tmp = '';
        const count = approvalItems.length;
        for (let i = 0; i < count; i++) {
            approvalFunction.push(standardApprovers[approvalItems[i].fx]);
        }
        // helperService.log(approvalFunction);
        return Promise.resolve(approvalFunction);
    }),
    checkApprovalFLow: (requestFlow, stimulatedFlow) => __awaiter(this, void 0, void 0, function* () {
        const tmpRequestFlow = requestFlow.map(item => item.username);
        const tmpStimulatedFlow = stimulatedFlow.map(item => item.username);
        console.log(tmpRequestFlow);
        console.log(tmpStimulatedFlow);
        console.log('In Both: ', helperService.inBoth(tmpRequestFlow, tmpStimulatedFlow));
        console.log('In First Only: ', helperService.inFirstOnly(tmpRequestFlow, tmpStimulatedFlow));
        const result = helperService.inSecondOnly(tmpRequestFlow, tmpStimulatedFlow);
        console.log('In Second Only: ', result);
        // const result = helperService.isEqual(tmpRequestFlow, tmpStimulatedFlow)
        // console.log(result);
        return Promise.resolve(!result.length);
    }),
    executeFunction: (fx, params) => __awaiter(this, void 0, void 0, function* () {
    }),
    inviteApprover: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                // Retrieve document
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    // helperService.log(req.body);
                    const invitedApprover = {
                        type: 'o',
                        username: req.body.approval.username,
                        fullname: req.body.approval.fullname,
                        step: req.body.approval.step,
                        comment: '',
                        decision: '',
                        decided_at: ''
                    };
                    const approvalLength = gkRequest.approval.length;
                    // console.log(approvalLength, req.body.position);
                    let newApproval = [];
                    if (approvalLength > 0) {
                        gkRequest.approval = yield helperService.insertItemInArray(gkRequest.approval, invitedApprover, req.body.position, req.body.approval.seq);
                    }
                    else {
                        gkRequest.approval.push(invitedApprover);
                    }
                    const updatedGkRequest = yield gkRequest.save();
                    if (updatedGkRequest) {
                        // TODO: Save the first history
                        const historyObject = {
                            "type": "comment",
                            "docId": updatedGkRequest._id,
                            "header": "<a href='#'>" + req['mySession'].username + "</a> invite an approver!",
                            "body": "Approver: " + JSON.stringify(invitedApprover),
                            "footer": "",
                        };
                        let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                        helperService.log(createdHistory);
                        const result = {
                            data: updatedGkRequest['approval'],
                        };
                        return response.ok(res, result);
                    }
                    else {
                        throw new Error('Inser Approver Failed!');
                    }
                }
            }
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    removeApprover: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                // Retrieve document
                let GkRequest = yield GkRequestsController.getModel(req, res);
                let gkRequest = yield GkRequest.findById(req.params._id);
                // helperService.log(gkRequest);
                if (!gkRequest) {
                    return response.fail_notFound(res);
                }
                else {
                    // helperService.log(req.body);
                    let removedApprover;
                    if (gkRequest.approval.indexOf(req.body.sequence)) {
                        removedApprover = Object.assign({}, gkRequest.approval[req.body.sequence]);
                        gkRequest.approval.splice(req.body.sequence, 1);
                    }
                    const updatedGkRequest = yield gkRequest.save();
                    if (updatedGkRequest) {
                        // TODO: Save the first history
                        const historyObject = {
                            "type": "comment",
                            "docId": updatedGkRequest._id,
                            "header": "<a href='#'>" + req['mySession'].username + "</a> remove an approver!",
                            "body": "Approver: " + JSON.stringify(removedApprover),
                            "footer": "",
                        };
                        let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                        helperService.log(createdHistory);
                        const result = {
                            data: updatedGkRequest['approval'],
                        };
                        return response.ok(res, result);
                    }
                    else {
                        throw new Error('Remove Approver Failed!');
                    }
                }
            }
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * MONGOOSE MODEL
    * Return a document model that is dynalically attachable to target database
    * @function getModel                  GkRequest (1-)
    * @function getHistoryModel           GkRequestHistory (1-)
    */
    /**
    * @function getModel
    * To create a new mongoose model from GkRequest Schema/ Collection in systemDb
    *
    * @param {express.Request} req: express.Request that contain mySession
    * @param {express.Request} res: express.Response for responding the request in case
    *
    * @return {Mongoose Model} gkRequest
    */
    getModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'GkRequest', GkRequestSchema);
    }),
    /**
    * @function getHistoryModel
    * To create a new mongoose model from GkRequestHistory Schema/ Collection in systemDb
    *
    * @param {express.Request} req: express.Request that contain mySession
    * @param {express.Request} res: express.Response for responding the request in case
    *
    * @return {Mongoose Model} gkRequestHistory
    */
    getHistoryModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'GkRequestHistory', GkRequestHistorySchema);
    }),
    /**
    * SUPPORTING FUNCTIONS
    * @function trackHistory
    * @function isLastApprover
    * @function concatArrayOfObjects
    */
    /**
    * @function trackHistory
    * Track changes history of document
    *
    * @param {express.Request} req: express.Request that contain mySession
    * @param {express.Request} res: express.Response for responding the request in case
    * @param {} trackParams:        Paramaters for trackHistory process
    * - @param {boolean} multi:        Multiple changes? True: Multiple changes; False: Individual change
    * - @param {string} tcode:         The module and action corresponding to data change
    * - @param {any} oldData:          Data before changed
    * - @param {any} newData:          Data after changed
    * @var {} history:              Historical changes of data tracked in History Collection
    * @return {GkRequestHistory}     Return the saved GkClientHistory document
    */
    trackHistory: (req, res, trackParams) => __awaiter(this, void 0, void 0, function* () {
        try {
            let GkRequestHistory = yield GkRequestsController.getHistoryModel(req, res);
            let history;
            if (!trackParams.multi) {
                const id = trackParams.newData._id || trackParams.oldData._id;
                delete trackParams.oldData._id;
                delete trackParams.newData._id;
                delete trackParams.oldData.created_at;
                delete trackParams.newData.created_at;
                const diff = deep(trackParams.oldData, trackParams.newData);
                // helperService.log(diff);
                history = {
                    docId: id,
                    username: req['mySession']._id,
                    tcode: trackParams.tcode,
                    diff: diff
                };
            }
            else {
                history = {
                    docId: '',
                    username: req['mySession']._id,
                    tcode: trackParams.tcode,
                    diff: [{
                            kind: 'U',
                            path: '',
                            lhs: '',
                            rhs: trackParams.newData
                        }]
                };
            }
            // helperService.log(history);
            let gkRequestHistory = new GkRequestHistory(history);
            return gkRequestHistory.save();
        }
        catch (err) {
            helperService.log(err);
        }
    }),
    /**
    * @function isLastApprover
    * Check the Request to find if stage is at last approver
    *
    * @param {GkRequest} gkRequest
    *
    * @return {boolean}
    */
    isLastApprover: (gkRequest) => {
        return ((gkRequest.next.length === 0) && (gkRequest.planned === gkRequest.pic.username));
    },
    /**
    * @function concatArrayOfObjects
    * Check the Request to find if stage is at last approver
    *
    * @param {} objectsArray
    *
    * @return {Array} approvalFlow
    */
    concatArrayOfObjects: (objectsArray) => {
        let approvalFlow = [];
        const iCount = objectsArray.length;
        for (let i = 0; i < iCount; i++) {
            const jCount = objectsArray[i].length;
            for (let j = 0; j < jCount; j++) {
                approvalFlow.push(objectsArray[i][j]);
            }
        }
        return approvalFlow;
    },
}; // End of module
module.exports = GkRequestsController;
