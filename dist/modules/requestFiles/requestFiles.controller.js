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
var deep = require('deep-diff').diff;
var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");
var helperService = require('../../services/helper.service');
// import  { HelperService } from '../../services/helper.service';
var DBConnect = require('../../services/dbConnect.service');
var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');
var fileService = require('../../services/files.service');
var RequestFileSchema = require('./requestFile.schema');
var RequestFileHistorySchema = require('./requestFile.history.schema');
var notificationsController = require('../../modules/notification/notifications.controller');
var requestHistoriesController = require('../requestHistories/requestHistories.controller');
var RequestFilesController = {
    getModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'RequestFile', RequestFileSchema);
    }),
    getHistoryModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'RequestFileHistory', RequestFileHistorySchema);
    }),
    findFilesByRequestId: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.params._id) {
                const result = {
                    message: `${req.params._id} is required!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestFiles = yield RequestFilesController.getModel(req, res);
                let requestFiles = yield RequestFiles.find({ docId: req.params._id });
                // console.log(requestFiles);
                if (!requestFiles) {
                    return response.fail_notFound(res);
                }
                else {
                    const result = {
                        message: '',
                        data: requestFiles,
                        total: requestFiles.length
                    };
                    return response.ok(res, result);
                }
            }
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    }),
    findFileById: (req, res) => __awaiter(this, void 0, void 0, function* () {
    }),
    uploadRequestFile: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                // console.log(req.params._id);
                // console.log('body:', req.body);
                // console.log('files:', req['files']);
                let uploadStatus = yield fileService.uploadRequestDocument(req, res);
                let data = uploadStatus.data;
                // Store information into DB
                let RequestFiles = yield RequestFilesController.getModel(req, res);
                let requestFiles = new RequestFiles(data);
                // let requestFiles = new RequestFiles({
                //   docId: req.params._id,
                //   originalname: data.originalname,
                //   path: data.path,
                //   desc: data.originalname,
                //   size: data.size,
                //   mimetype: data.mimetype,
                //   username: req['mySession'].username,
                //   status: 'Unmarked'
                // });
                // console.log(requestFiles);
                let createdFile = yield requestFiles.save();
                // console.log(createdFile);
                // TODO: Save the first history
                const historyObject = {
                    "type": "comment",
                    "docId": req.params._id,
                    "header": "<a href='#'>" + req['mySession'].username + "</a> upload a file!",
                    "body": "Filename: " + data.originalname,
                    "footer": "",
                };
                let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                helperService.log(createdHistory);
                const result = {
                    message: 'Creation completed!',
                    data: createdFile
                };
                return response.ok_created(res, result);
            }
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    }),
    uploadRequestFiles: (req, res) => __awaiter(this, void 0, void 0, function* () {
    }),
    downloadRequestFile: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestFiles = yield RequestFilesController.getModel(req, res);
                let requestFiles = yield RequestFiles.findById(req.params._id);
                if (!requestFiles) {
                    return response.fail_notFound(res);
                }
                else {
                    // console.log('Generate temporary file for download');
                    let originalname = yield fileService.downloadRequestDocument(req, res, requestFiles);
                    // helperService.log(req.body);
                    // specify tcode of download
                    // dl = download
                    // in other case tcode is store in (req.body.tcode)
                    const notification = {
                        tcode: 'dl',
                        id: '',
                        icon: 'file_download',
                        desc: originalname + ' is ready for download!',
                        url: originalname,
                        data: {
                            icon: 'file_download',
                            desc: originalname + ' is ready for download!',
                            url: originalname
                        },
                        username: req['mySession']['username'],
                        creator: 'system',
                        isMark: true
                    };
                    // helperService.log(notification);
                    let notificationResult = yield notificationsController.module11(req, res, notification);
                    const result = {
                        message: '',
                        data: notificationResult
                    };
                    setTimeout(() => { response.ok(res, result); }, 5000);
                }
            }
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    }),
    renameRequestFile: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestFiles = yield RequestFilesController.getModel(req, res);
                let requestFile = yield RequestFiles.findById(req.params._id);
                if (!requestFile) {
                    return response.fail_notFound(res);
                }
                else {
                    // console.log(req.body);
                    const originalName = requestFile.desc;
                    requestFile.desc = req.body.desc;
                    let updatedFile = yield requestFile.save();
                    // TODO: Save the first history
                    const historyObject = {
                        "type": "comment",
                        "docId": requestFile.docId,
                        "header": "<a href='#'>" + req['mySession'].username + "</a> rename a file!",
                        "body": "Original name: " + originalName + ". New name: " + req.body.desc,
                        "footer": "",
                    };
                    let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                    helperService.log(createdHistory);
                    if (updatedFile) {
                        const result = {
                            data: updatedFile,
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
    patchRequestFile: (req, res, patchType) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestFiles = yield RequestFilesController.getModel(req, res);
                let requestFile = yield RequestFiles.findById(req.params._id);
                if (!requestFile) {
                    return response.fail_notFound(res);
                }
                else {
                    const status = requestFile.status;
                    switch (patchType) {
                        case 'mark':
                            if (status === 'Unmarked') {
                                requestFile.status = 'Marked';
                            }
                            break;
                        case 'unmark':
                            if (status === 'Marked') {
                                requestFile.status = 'Unmarked';
                            }
                            break;
                        default:
                            break;
                    }
                    let updatedFile = yield requestFile.save();
                    // TODO: Save the first history
                    const historyObject = {
                        "type": "comment",
                        "docId": requestFile.docId,
                        "header": "<a href='#'>" + req['mySession'].username + "</a> patch a file!",
                        "body": "Patch action: " + patchType,
                        "footer": "",
                    };
                    let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                    helperService.log(createdHistory);
                    if (updatedFile) {
                        const result = {
                            data: updatedFile,
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
    markRequestFile: (req, res) => __awaiter(this, void 0, void 0, function* () {
        RequestFilesController.patchRequestFile(req, res, 'mark');
    }),
    unmarkRequestFile: (req, res) => __awaiter(this, void 0, void 0, function* () {
        RequestFilesController.patchRequestFile(req, res, 'unmark');
    }),
    deleteRequestFile: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tcode = 'gkcln18';
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = {
                    message: `${req.params._id} is invalid Id!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestFiles = yield RequestFilesController.getModel(req, res);
                let requestFiles = yield RequestFiles.findById(req.params._id);
                if (!requestFiles) {
                    return response.fail_notFound(res);
                }
                else {
                    if (requestFiles.status == 'Marked') {
                        let removedFile = yield requestFiles.remove();
                        if (removedFile) {
                            // console.log(removedClient);
                            // const trackParams = {
                            //   multi: false,
                            //   tcode: tcode,
                            //   oldData: removedClient.toObject(),
                            //   newData: {_id:''}
                            // }
                            // let trackHistory = GkClientsController.trackHistory(req, res, trackParams);
                            // TODO: Save the first history
                            const historyObject = {
                                "type": "comment",
                                "docId": removedFile.docId,
                                "header": "<a href='#'>" + req['mySession'].username + "</a> remove a file!",
                                "body": "File info: " + JSON.stringify(removedFile),
                                "footer": "",
                            };
                            let createdHistory = yield requestHistoriesController.module11(req, res, historyObject);
                            helperService.log(createdHistory);
                            const result = {
                                data: removedFile,
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
                            data: {},
                        };
                        return response.fail_preCondition(res, result);
                    }
                }
            }
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    })
};
module.exports = RequestFilesController;
