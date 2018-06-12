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
var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
// INTERNAL
var ConstantsBase = require('../../config/base/constants.base');
var ChatSchema = require('./chat.schema');
var response = require('../../services/response.service');
/**
* ChatController
*
* @function registerRoom
* @function getRoom
*/
var ChatController = {
    /**
    * @function registerRoom
    * Register a room
    *
    * @param req
    * @param res
    *
    * @return {response}
    */
    registerRoom: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const roomId = new mongoose.Types.ObjectId();
            const result = {
                data: roomId,
            };
            console.log('postChat');
            return response.ok(res, result);
        }
        catch (error) {
            const result = {
                message: 'Session Initialization Error!',
                data: error.message
            };
            return response.fail_serverError(res, result);
        }
    }),
    /**
    * @function getRoom
    * get a room
    *
    * @param req
    * @param res
    *
    * @return {response}
    */
    getRoom: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('getRoom');
        }
        catch (error) {
            const result = {
                message: 'Session Retrieval Error',
                data: error.message
            };
            return response.fail_serverError(res, result);
        }
    }),
};
module.exports = ChatController;
