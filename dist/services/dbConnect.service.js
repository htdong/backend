var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// EXTERNAL
var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
var response = require('./response.service');
/**
* DBConnect
* DB connection and closure utilities
*
* @function connectSystemDB
* @function connectMasterDB
* @function connectYearDB
* @function closeDB
*/
var DBConnect = {
    /**
    * @function connectSystemDB
    * To return a mongoose model of a collection in systemDB
    *
    * @param req          request
    * @param res          response
    * @param model        Name of collection model
    * @param schema       Mongoose schema
    *
    * @return { Mongoose collection model }
    */
    connectSystemDB: (req, res, model, schema) => __awaiter(this, void 0, void 0, function* () {
        try {
            const systemDb = yield mongoose.createConnection(process.env.MONGO_SYSTEM_URI, { useMongoClient: true, promiseLibrary: require("bluebird") });
            return systemDb.model(model, schema);
        }
        catch (err) {
            err['data'] = 'Error in connecting server and create collection model!';
            return response.handle_server_error(res, err);
        }
    }),
    /**
    * @function connectMasterDB
    * To return a mongoose model of a collection in client's MasterDB
    *
    * @param req          request
    * @param res          response
    * @param clientCode   initial name of client = prefix of client's database
    * @param model        Name of collection model
    * @param schema       Mongoose schema
    *
    * @return { Mongoose collection model }
    */
    connectMasterDB: (req, res, model, schema, clientCode) => __awaiter(this, void 0, void 0, function* () {
        try {
            const ConstantsBase = require('../config/base/constants.base');
            // const DbUri = ConstantsBase.urlMongo;
            const DbUri = process.env.MONGO_URI;
            const masterDb = yield mongoose.createConnection(DbUri + clientCode + "_0000", {
                useMongoClient: true,
                promiseLibrary: require("bluebird")
            });
            return masterDb.model(model, schema);
        }
        catch (err) {
            err['data'] = 'Error in connecting server and create collection model!';
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function connectYearDB
    * To return a mongoose model of a collection in client's YearDB
    *
    * @param req          request
    * @param res          response
    * @param clientCode   initial name of client = prefix of client's database
    * @param year         working year
    * @param model        Name of collection model
    * @param schema       Mongoose schema
    *
    * @return { Mongoose collection model }
    */
    connectYearDB: (req, res, model, schema, clientCode, year) => __awaiter(this, void 0, void 0, function* () {
        try {
            const ConstantsBase = require('../config/base/constants.base');
            // const DbUri = ConstantsBase.urlMongo;
            const DbUri = process.env.MONGO_URI;
            const yearDb = yield mongoose.createConnection(DbUri + clientCode + "_" + year, {
                useMongoClient: true,
                promiseLibrary: require("bluebird")
            });
            return yearDb.model(model, schema);
        }
        catch (err) {
            err['data'] = 'Error in connecting server and create collection model!';
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function closeDB
    * To close DB Connection
    *
    * @param req          request
    * @param res          response
    * @param DBConnection
    */
    closeDB: (req, res, DBConnection) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (DBConnection) {
                DBConnection.close()
                    .then(() => console.log('System DB is closed!'))
                    .catch((err) => {
                    throw new Error('Failed to close system DB. Error: ' + err.message);
                });
            }
        }
        catch (err) {
            return response.handle_server_error(res, err);
        }
    }),
};
module.exports = DBConnect;
