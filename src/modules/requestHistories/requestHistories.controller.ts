import express = require("express");
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

  getModel: async (req: express.Request, res: express.Response) => {
    return DBConnect.connectSystemDB(req, res, 'RequestHistory', RequestHistorySchema);
  },

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
  module11: async (req: express.Request, res: express.Response, historyObject) => {
    try {
      // helperService.log(historyObject);

      let History = await RequestHistoriesController.getModel(req, res);
      let history = new History(historyObject);

      let historyResult = await history.save();

      // helperService.log(notificationResult);

      return historyResult;
    }
    catch (err) {
      return response.handle_createOrSaveError(res, err);
    }
  },

  findHistoriessByRequestId: async (req: express.Request, res: express.Response) => {
    try {
      if (!req.params._id) {
        const result = {
          message: `${req.params._id} is required!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestHistories = await RequestHistoriesController.getModel(req, res);

        let params = req.query;
        console.log(params);

        let query = {
          docId: req.params._id
        };

        let options = {
          select: 'type header body footer created_at',
          sort: {created_at: -1},
          lean: false,
          offset: parseInt(params.first),
          limit: parseInt(params.rows)
        };

        let requestHistories = await RequestHistories.paginate(query, options);

        console.log(requestHistories);

        const result = {
          data: requestHistories.docs,
          total: requestHistories.total,
        }
        return response.ok_pagination(res, result);
      }
    }
    catch (err) {
      response.fail_serverError(res, err);
    }
  }

}

module.exports = RequestHistoriesController;
