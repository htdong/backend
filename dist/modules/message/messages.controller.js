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
var helperService = require('../../services/helper.service');
// import  { HelperService } from '../../services/helper.service';
var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");
var DBConnect = require('../../services/dbConnect.service');
var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');
var MessageSchema = require('./message.schema');
var MessagesController = {
    /**
    * @function getModel
    * To create a new mongoose model from (module) Schema/ Collection in systemDb
    *
    * @param {express.Request} req: express.Request that contain mySession
    * @param {express.Request} res: express.Response for responding the request in case
    *
    * @return {Mongoose Model} module
    */
    getModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'Message', MessageSchema);
        // try {
        //   const systemDbUri = ConstantsBase.urlSystemDb;
        //   const systemDb = await mongoose.createConnection(
        //     systemDbUri,
        //     { useMongoClient: true, promiseLibrary: require("bluebird")}
        //   );
        //   return systemDb.model('Message', MessageSchema);
        // }
        // catch (err) {
        //   err['data'] = 'Error in connecting server and create collection model!';
        //   return response.fail_serverError(res, err);
        // }
    }),
    module11: (req, res, messageObject) => __awaiter(this, void 0, void 0, function* () {
        try {
            helperService.log(messageObject);
            let Message = yield MessagesController.getModel(req, res);
            let message = new Message(messageObject);
            let messageResult = yield message.save();
            helperService.log(messageResult);
            return messageResult;
        }
        catch (err) {
            return response.handle_createOrSaveError(res, err);
        }
    }),
    /**
    * @function module12
    * Retrieve a document from (module) collection
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
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                let Message = yield MessagesController.getModel(req, res);
                let message = yield Message.findById(req.params._id);
                helperService.log(message);
                if (!message) {
                    return response.fail_notFound(res);
                }
                else {
                    const result = {
                        message: '',
                        data: message,
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
    * @function module18
    * Delete a document in (module) collection
    * Corresonding tcode = module + 18
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {response}
    * - 200
    * - 400 (Invalid Id)
    * - 404 (Not Found)
    * - 412 (Failed Precondition)
    * - 500
    */
    module18: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
                const result = { message: `${req.params._id} is invalid Id!` };
                return response.fail_badRequest(res, result);
            }
            else {
                let Message = yield MessagesController.getModel(req, res);
                let message = yield Message.findById(req.params._id);
                if (!message) {
                    return response.fail_notFound(res);
                }
                else {
                    let removedMessage = yield message.remove();
                    if (removedMessage) {
                        // console.log(removedClient);
                        const result = {
                            data: removedMessage,
                        };
                        return response.ok(res, result);
                    }
                    else {
                        throw new Error('Remove failed!');
                    }
                }
            }
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function module1x
    * List of document in (module) collection
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
            let Message = yield MessagesController.getModel(req, res);
            let params = req.query;
            console.log(params);
            let query = {
                $or: [
                    { username: { '$regex': params.filter, '$options': 'i' } },
                    { creator: { '$regex': params.filter, '$options': 'i' } }
                ]
            };
            let options = {
                select: '_id tcode id icon desc url data username creator isMarked created_at',
                sort: JSON.parse(params.sort),
                lean: false,
                offset: parseInt(params.first),
                limit: parseInt(params.rows)
            };
            let messages = yield Message.paginate(query, options);
            const result = {
                data: messages.docs,
                total: messages.total,
            };
            return response.ok_pagination(res, result);
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
};
module.exports = MessagesController;
