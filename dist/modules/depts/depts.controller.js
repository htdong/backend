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
var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");
var ConstantsBase = require('../../config/base/constants.base');
var DBConnect = require('../../services/dbConnect.service');
var fileService = require('../../services/files.service');
var helperService = require('../../services/helper.service');
var response = require('../../services/response.service');
var DeptSchema = require('./dept.schema');
var DeptHistorySchema = require('./dept.history.schema');
var notificationsController = require('../notification/notifications.controller');
var DeptsController = {
    /**
    * MONGOOSE MODEL
    * Return a document model that is dynalically attachable to target database
    *
    * @function getModel                  Dept (1-, 2-, )
    * @function getHistoryModel           DeptHistory (1-, 2-)
    */
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
        return DBConnect.connectMasterDB(req, res, 'Dept', DeptSchema, req['mySession'].clientDb);
        // try {
        //   const systemDbUri = ConstantsBase.urlSystemDb;
        //   const systemDb = await mongoose.createConnection(
        //     systemDbUri,
        //     { useMongoClient: true, promiseLibrary: require("bluebird")}
        //   );
        //   return systemDb.model('Dept', DeptSchema);
        // }
        // catch (err) {
        //   err['data'] = 'Error in connecting server and create collection model!';
        //   return response.fail_serverError(res, err);
        // }
    }),
    /**
    * @function getHistoryModel
    * To create a new mongoose model from (module) Schema/ Collection in systemDb
    *
    * @param {express.Request} req: express.Request that contain mySession
    * @param {express.Request} res: express.Response for responding the request in case
    *
    * @return {Mongoose Model} moduleHistory
    */
    getHistoryModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectMasterDB(req, res, req['mySession'].clientDb, 'DeptHistory', DeptHistorySchema);
        // try {
        //   const systemDbUri = ConstantsBase.urlSystemDb;
        //   const systemDb = await mongoose.createConnection(
        //     systemDbUri,
        //     { useMongoClient: true, promiseLibrary: require("bluebird") }
        //   );
        //   return systemDb.model('DeptHistory', DeptHistorySchema);
        // }
        // catch (err) {
        //   err['data'] = 'Error in connecting server and create collection model!';
        //   return response.fail_serverError(res, err);
        // }
    })
}; // End of module
module.exports = DeptsController;
