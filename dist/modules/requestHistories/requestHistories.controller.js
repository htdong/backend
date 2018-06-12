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
var RequestHistorySchema = require('./requestHistory.schema');
var notificationsController = require('../../modules/notification/notifications.controller');
var RequestHistoriesController = {
    getModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'RequestHistory', RequestHistorySchema);
    }),
    /**
    * @function module11
    * Create new document for (requestHistory) collection
    * No corresonding tcode
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 201
    * - 401
    * - 500
    */
    module11: (req, res, historyObject) => __awaiter(this, void 0, void 0, function* () {
        try {
            // helperService.log(historyObject);
            let History = yield RequestHistoriesController.getModel(req, res);
            let history = new History(historyObject);
            let historyResult = yield history.save();
            // helperService.log(notificationResult);
            return historyResult;
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    findHistoriessByRequestId: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.params._id) {
                const result = {
                    message: `${req.params._id} is required!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestHistories = yield RequestHistoriesController.getModel(req, res);
                let params = req.query;
                console.log(params);
                let query = {
                    docId: req.params._id
                };
                let options = {
                    select: 'type header body footer created_at',
                    sort: { created_at: -1 },
                    lean: false,
                    offset: parseInt(params.first),
                    limit: parseInt(params.rows)
                };
                let requestHistories = yield RequestHistories.paginate(query, options);
                console.log(requestHistories);
                const result = {
                    data: requestHistories.docs,
                    total: requestHistories.total,
                };
                return response.ok_pagination(res, result);
            }
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    })
};
module.exports = RequestHistoriesController;
