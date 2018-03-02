import express = require("express");
Promise = require("bluebird");
var fs = require("fs");

import  { HelperService } from '../../services/helper.service';

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");

var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');

var DashboardPageSchema = require('./dashboardPage.schema');
var DashboardItemSchema = require('./dashboardItem.schema');

/*****************************************************************************************
 * DASHBOARD CONTROLLER
 *
 *****************************************************************************************/
var DashboardController = {

  getDashboardPageModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        {
          useMongoClient: true,
          promiseLibrary: require("bluebird")
        }
      );
      return systemDb.model('DashboardPage', DashboardPageSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      DashboardController.handleServerError(req, res, err);
    }
  },

  getDashboardItemModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        {
          useMongoClient: true,
          promiseLibrary: require("bluebird")
        }
      );
      return systemDb.model('DashboardItem', DashboardItemSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      DashboardController.handleServerError(req, res, err);
    }
  },

  findPaginatedDashboardPages: async (req: express.Request, res: express.Response) => {
    try {
      let DashboardPage = await DashboardController.getDashboardPageModel(req, res);
      let params = req.query;
      console.log(params);

      let query = {
        $or: [
          {module: {'$regex': params.filter, '$options' : 'i'}},
          {type: {'$regex': params.filter, '$options' : 'i'}},
          {creator: {'$regex': params.filter, '$options' : 'i'}},
          {name: {'$regex': params.filter, '$options' : 'i'}}
        ]
      };

      let options = {
        select: '_id module type creator name status1 status2',
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
      DashboardController.handleServerError(req, res, err);
    }
  },

  getDashboardItems: async (req: express.Request, res: express.Response) => {
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
      DashboardController.handleServerError(req, res, err);
    }
  },

  /**
   * Function to standardize response of pre-condition failed
   */
  handleFailedPrecondition: async(req: express.Request, res: express.Response, validatedResult) => {
    const result = {
      message: 'Data failed validation process',
      data: {
        "n": validatedResult['error'].length + validatedResult['data'].length,
        "nModified": 0,
        "nErrors": validatedResult['error'].length,
        "errorDetails": JSON.stringify(validatedResult['error']),
      }
    }
    return response.fail_preCondition(res, result);
  },

  /**
   * Function to standardize response of success
   */
  handlePassedValidation: async(req: express.Request, res: express.Response, tcode, validatedResult) => {
    try {

      let GkClient = await GkClientsController.getModel(req, res);
      let result;
      console.log(tcode);

      return new Promise((resolve, reject)=>{

        Promise
          .all(validatedResult['data'].map(item => {
            switch (tcode) {
              case 'gkcln21':
                return GkClient.create(item).catch(error => ({error}));

              case 'gkcln23':
                console.log(item._id);
                return GkClient.findByIdAndUpdate(item._id, item, {upsert:true}).catch(error => ({error}));
                // if (item._id) {
                //
                // } else {
                //   return GkClient.create(item).catch(error => ({error}));
                // }
                // console.log('here');
                // return GkClient.create(item).catch(error => ({error}));


              default:
                return response.fail_badRequest(res, '');
            }

          }))

          .then(items => {
            console.log(items);
            let errorArray = [];
            let count = 0;

            items.forEach(item => {
              if (item) {
                count = count + 1;
                if (item['error']) {
                  errorArray.push({ line: count, error: `Error: ${item['error'].errmsg}` });
                }
              }
            });

            let message = `${(validatedResult['data'].length - errorArray.length)} / ${validatedResult['data'].length} items are processed!`;
            let result = ({
              message: message,
              data: {
                "n": validatedResult['data'].length,
                "nModified": (validatedResult['data'].length - errorArray.length),
                "nErrors": errorArray.length,
                "errorDetails": errorArray,
              },
            });

            if (validatedResult['data'].length - errorArray.length) {
              const filename = validatedResult['uploadStatus'].data.path.split('/');
              const trackParams = {
                multi: true,
                tcode: tcode,
                oldData: {},
                newData: filename[filename.length - 1]
              }
              let trackHistory = GkClientsController.trackHistory(req, res, trackParams);
            }
            return response.handle_upsert(res, result);
          });

      });

    } catch(error) {
      console.log(error);
      const result = {
        error: error
      }
      return response.fail_serverError(res, result);
    }

  },

  /**
   * Function to standardize response of server error
   */
  handleServerError: async(req: express.Request, res: express.Response, error) => {
    const result = {
      message: error['message'] || '',
      data: error['data'] || []
    }
    return response.fail_serverError(res, result);
  }

}

module.exports = DashboardController;
