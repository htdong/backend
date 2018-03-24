// EXTERNAL
import express = require("express");
Promise = require("bluebird");
var fs = require("fs");

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");

// INTERNAL
var ConstantsBase = require('../../config/base/constants.base');
var DBConnect = require('../../services/dbConnect.service');
var helperService = require('../../services/helper.service');
var response = require('../../services/response.service');

// LOCAL
var DashboardPageSchema = require('./dashboardPage.schema');
var DashboardItemSchema = require('./dashboardItem.schema');

/**
* DashboardController
*
* @function getDashboardPageModel
* @function getDashboardItemModel
* @function findPaginatedDashboardPages
* @function getDashboardItems
* @function
*/
var DashboardController = {

  getDashboardPageModel: async (req: express.Request, res: express.Response) => {
    return DBConnect.connectSystemDB(req, res, 'DashboardPage', DashboardPageSchema);
  },

  getDashboardItemModel: async (req: express.Request, res: express.Response) => {
    return DBConnect.connectSystemDB(req, res, 'DashboardItem', DashboardItemSchema);
  },

  action1x: async (req: express.Request, res: express.Response) => {
    try {
      let DashboardPage = await DashboardController.getDashboardPageModel(req, res);
      let params = req.query;
      console.log(params);

      let query = {
        $or: [
          {module: {'$regex': params.filter, '$options' : 'i'}},
          {type: {'$regex': params.filter, '$options' : 'i'}},
          {creator: {'$regex': params.filter, '$options' : 'i'}},
          {label: {'$regex': params.filter, '$options' : 'i'}}
        ]
      };

      let options = {
        select: '_id module type creator label status1 status2',
        sort: JSON.parse(params.sort),
        lean: false,
        offset: parseInt(params.first),
        limit: parseInt(params.rows)
      };

      let dashboardPages = await DashboardPage.paginate(query, options);
      const result = {
        data: dashboardPages.docs,
        total: dashboardPages.total,
      }
      return response.ok_pagination(res, result);
    }
    catch (err) {
      response.fail_serverError(res, err);
    }
  },

  action12: async (req: express.Request, res: express.Response) => {
    try {
      let DashboardItems = await DashboardController.getDashboardItemModel(req, res);
      console.log(req.params);

      let dashboardItems = await DashboardItems.find({module: req.params.id});

      const result = {
        data: dashboardItems,
      }
      return response.ok(res, result);
    }
    catch (err) {
      response.fail_serverError(res, err);
    }
  }

}

module.exports = DashboardController;
