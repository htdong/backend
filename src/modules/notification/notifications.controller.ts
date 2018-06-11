import express = require("express");
Promise = require("bluebird");

var helperService = require('../../services/helper.service');
// import  { HelperService } from '../../services/helper.service';

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");

var DBConnect = require('../../services/dbConnect.service');
var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');

var NotificationSchema = require('./notification.schema');

var NotificationsController = {

  /**
  * @function getModel
  * To create a new mongoose model from (module) Schema/ Collection in systemDb
  *
  * @param {express.Request} req: express.Request that contain mySession
  * @param {express.Request} res: express.Response for responding the request in case
  *
  * @return {Mongoose Model} module
  */
  getModel: async (req: express.Request, res: express.Response) => {
    return DBConnect.connectSystemDB(req, res, 'Notification', NotificationSchema);
    // try {
    //   const systemDbUri = ConstantsBase.urlSystemDb;
    //   const systemDb = await mongoose.createConnection(
    //     systemDbUri,
    //     { useMongoClient: true, promiseLibrary: require("bluebird")}
    //   );
    //   return systemDb.model('Notification', NotificationSchema);
    // }
    // catch (err) {
    //   err['data'] = 'Error in connecting server and create collection model!';
    //   return response.fail_serverError(res, err);
    // }
  },

  module11: async(req: express.Request, res: express.Response, notificationObject) => {
    try {
      // helperService.log(notificationObject);

      let Notification = await NotificationsController.getModel(req, res);
      let notification = new Notification(notificationObject);

      let notificationResult = await notification.save();

      // helperService.log(notificationResult);

      return notificationResult;
    }
    catch (err) {
      return response.handle_createOrSaveError(res, err);
    }
  },

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
  module12: async(req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        let Notification = await NotificationsController.getModel(req, res);
        let notification = await Notification.findById(req.params._id);
        // helperService.log(notification);
        if (!notification) {
          return response.fail_notFound(res);
        } else {
          const result = {
            message: '',
            data: notification,
            total: 1
          }
          return response.ok(res, result);
        }
      }
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function patch
  * To execute patch a particular field of one document in collection, supporting:
  * - mark / unmark
  *
  * @param {string} patchType:     One value in [mark, unmark]
  * @return {response}
  */

  patch: async(req, res, patchType) => {
    try {
      let tcode = '';

      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let Notification = await NotificationsController.getModel(req, res);
        let notification = await Notification.findById(req.params._id);

        // console.log(notification);
        if (!notification) {
          return response.fail_notFound(res);
        } else {
          switch (patchType) {
            case 'mark':
              tcode = 'gkcln16';
              notification.isMark = true;
              break;

            case 'unmark':
              tcode = 'gkcln17';
              notification.isMark = false;
              break;

            default:
              break;
          }

          let updatedClient = await notification.save();

          if (updatedClient) {
            const result = {
              data: updatedClient,
            }
            return response.ok(res, result);
          } else {
            throw new Error('Patch failed!');
          }
        }
      }
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function module16
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
  module16: async(req: express.Request, res: express.Response) => {
    try {
      return NotificationsController.patch(req, res, 'mark');
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function module17
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
  module17: async(req: express.Request, res: express.Response) => {
    try {
      return NotificationsController.patch(req, res, 'unmark');
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

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
  module18: async(req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        let Notification = await NotificationsController.getModel(req, res);
        let notification = await Notification.findById(req.params._id);
        if (!notification) {
          return response.fail_notFound(res);
        } else {
          let removedNotification = await notification.remove();
          if (removedNotification) {
            // console.log(removedClient);
            const result = {
              data: removedNotification,
            }
            return response.ok(res, result);
          } else {
            throw new Error('Remove failed!');
          }
        }
      }
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

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
  module1x: async(req: express.Request, res: express.Response) => {
    try {
      let Notification = await NotificationsController.getModel(req, res);
      let params = req.query;
      // console.log(params);

      let query = {
        $or: [
          {username: {'$regex': params.filter, '$options' : 'i'}},
          {creator: {'$regex': params.filter, '$options' : 'i'}}
        ]
      };

      let options = {
        select: '_id tcode id icon desc url data username creator isMark created_at',
        sort: JSON.parse(params.sort),
        lean: false,
        offset: parseInt(params.first),
        limit: parseInt(params.rows)
      };

      let notifications = await Notification.paginate(query, options);
      const result = {
        data: notifications.docs,
        total: notifications.total,
      }

      helperService.log(result);

      setTimeout(()=>{
        return response.ok_pagination(res, result);
      }, 3000);

    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

};

module.exports = NotificationsController;
