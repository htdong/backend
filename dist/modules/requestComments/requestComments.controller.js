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
var RequestCommentSchema = require('./requestComment.schema');
var notificationsController = require('../../modules/notification/notifications.controller');
var requestHistoriesController = require('../requestHistories/requestHistories.controller');
var RequestCommentsController = {
    getModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'RequestComment', RequestCommentSchema);
    }),
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
            if (!req.body.id) {
                const result = {
                    message: `${req.body.id} is required!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestComments = yield RequestCommentsController.getModel(req, res);
                let params = req.body;
                // console.log(params);
                const hashtag = helperService.extractHashtag(params.comment);
                console.log(hashtag);
                if (hashtag) {
                    hashtag.forEach(item => {
                        const notification = {
                            tcode: 'ntfct',
                            id: '',
                            icon: 'comment',
                            desc: req['mySession'].username + ' message: ' + params.comment,
                            url: '',
                            data: {
                                icon: 'comment',
                                desc: '',
                                url: ''
                            },
                            username: item.slice(1, item.length),
                            creator: 'system',
                            isMark: true
                        };
                        let notificationResult = notificationsController.module11(req, res, notification);
                        // TODO: Save the first history
                        const historyObject = {
                            "type": "comment",
                            "docId": req.body.id,
                            "header": "<a href='#'>" + req['mySession'].username + "</a> message to <a href='#'>" + item.slice(1, item.length) + "</a>!",
                            "body": params.comment,
                            "footer": "",
                        };
                        let createdHistory = requestHistoriesController.module11(req, res, historyObject);
                        helperService.log(createdHistory);
                    });
                }
                const newComment = {
                    docId: params.id,
                    username: req['mySession'].username,
                    fullname: req['mySession'].fullname,
                    avatar: req['mySession'].avatar,
                    comment: params.comment
                };
                let requestComment = new RequestComments(newComment);
                let createdComment = yield requestComment.save();
                // TODO: Save the first history
                // Return reult
                const result = {
                    message: 'Creation completed!',
                    data: createdComment
                };
                return response.ok_created(res, result);
            }
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    findCommentsByRequestId: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.params._id) {
                const result = {
                    message: `${req.params._id} is required!`,
                };
                return response.fail_badRequest(res, result);
            }
            else {
                let RequestComments = yield RequestCommentsController.getModel(req, res);
                let params = req.query;
                console.log(params);
                let query = {
                    docId: req.params._id
                };
                let options = {
                    select: 'username fullname avatar created_at comment',
                    sort: { created_at: -1 },
                    lean: false,
                    offset: parseInt(params.first),
                    limit: parseInt(params.rows)
                };
                let requestComments = yield RequestComments.paginate(query, options);
                console.log(requestComments);
                const result = {
                    data: requestComments.docs,
                    total: requestComments.total,
                };
                return response.ok_pagination(res, result);
            }
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    })
};
module.exports = RequestCommentsController;
