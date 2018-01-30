// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// Internal
var ConstantsBase = require('../../config/base/constants.base');
var ChatSchema = require('./chat.schema');
var response = require('../../services/response.service');

var ChatController = {

  /* Register a room */
  registerRoom: async(req: express.Request, res: express.Response)=> {
    try {
      const roomId = new mongoose.Types.ObjectId();
      const result = {
        data: roomId,
      }
      console.log('postChat');
      return response.ok(res, result);
    }
    catch (error) {
      const result = {
        message: 'Session Initialization Error!',
        data: error.message
      }
      return response.fail_serverError(res, result);
    }
  },

  /* Return: Async directly return response via success or error [served as controler] */
  getRoom: async(req: express.Request, res: express.Response) => {
    try {
      console.log('getRoom');
    }
    catch (error) {
      const result = {
        message: 'Session Retrieval Error',
        data: error.message
      }
      return response.fail_serverError(res, result);
    }

  },

}

module.exports = ChatController;
