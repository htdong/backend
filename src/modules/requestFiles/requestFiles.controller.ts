import express = require("express");
Promise = require("bluebird");
var fs = require("fs");

var deep = require('deep-diff').diff;

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");

import  { HelperService } from '../../services/helper.service';

var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');
var FilesService = require('../../services/files.service');

var RequestFileSchema = require('./requestFile.schema');
var RequestFileHistorySchema = require('./requestFile.history.schema');

var notificationsController = require('../../modules/notification/notifications.controller');

var RequestFilesController = {

  getModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        {
          useMongoClient: true,
          promiseLibrary: require("bluebird")
        }
      );
      return systemDb.model('RequestFile', RequestFileSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      RequestFilesController.handleServerError(req, res, err);
    }
  },

  getHistoryModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        {
          useMongoClient: true,
          promiseLibrary: require("bluebird")
        }
      );
      return systemDb.model('RequestFileHistory', RequestFileHistorySchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      RequestFilesController.handleServerError(req, res, err);
    }
  },

  findFilesByRequestId: async (req: express.Request, res: express.Response) => {
    try {
      if (!req.params._id) {
        const result = {
          message: `${req.params._id} is required!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestFiles = await RequestFilesController.getModel(req, res);
        let requestFiles = await RequestFiles.find({docId: req.params._id});
        console.log(requestFiles);
        if (!requestFiles) {
          return response.fail_notFound(res);
        } else {
          const result = {
            message: '',
            data: requestFiles,
            total: requestFiles.length
          }
          return response.ok(res, result);
        }
      }
    }
    catch (err) {
      RequestFilesController.handleServerError(req, res, err);
    }
  },

  findFileById: async (req: express.Request, res: express.Response) => {

  },

  uploadRequestFile: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);
      } else {
        console.log(req.params._id);
        console.log('body:', req.body);
        console.log('files:', req['files']);

        let fileService = new FilesService();
        let uploadStatus = await fileService.uploadRequestFile(req, res);

        let data = uploadStatus.data;

        // Store information into DB
        let RequestFiles = await RequestFilesController.getModel(req, res);
        let requestFiles = new RequestFiles(data);
        // let requestFiles = new RequestFiles({
        //   docId: req.params._id,
        //   originalname: data.originalname,
        //   path: data.path,
        //   desc: data.originalname,
        //   size: data.size,
        //   mimetype: data.mimetype,
        //   username: req['mySession'].username,
        //   status: 'Unmarked'
        // });
        console.log(requestFiles);

        let createdFile = await requestFiles.save();

        const result = {
          message: 'Creation completed!',
          data: createdFile
        }
        return response.ok_created(res, result);
      }
    }
    catch (err) {
      RequestFilesController.handleServerError(req, res, err);
    }
  },

  uploadRequestFiles: async (req: express.Request, res: express.Response) => {

  },

  downloadRequestFile: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestFiles = await RequestFilesController.getModel(req, res);
        let requestFiles = await RequestFiles.findById(req.params._id);

        if (!requestFiles) {
          return response.fail_notFound(res);
        } else {
          console.log('Generate temporary file for download');
          let fileService = new FilesService();

          let originalname = await fileService.downloadRequestDocument(req, res, requestFiles);

          HelperService.log(req.body);

          const notification = {
            tcode: 'dl',
            // dl = download
            // req.body.tcode,
            id: '',
            icon: 'file_download',
            desc: originalname + ' is ready for download!',
            url: originalname,
            data: {
              icon: 'file_download',
              desc: originalname + ' is ready for download!',
              url: originalname
            },
            username: req['mySession']['username'],
            creator: 'system',
            isMark: true
          }

          HelperService.log(notification);

          let a = await notificationsController.module11(req, res, notification);

          const result = {
            message: '',
            data: notification
          }
          response.ok(res, result);


        }
      }
    }
    catch (err) {
      RequestFilesController.handleServerError(req, res, err);
    }

  },

  renameRequestFile: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestFiles = await RequestFilesController.getModel(req, res);
        let requestFile = await RequestFiles.findById(req.params._id);

        if (!requestFile) {
          return response.fail_notFound(res);
        } else {
          // console.log(req.body);
          requestFile.desc = req.body.desc;
          let updatedFile = await requestFile.save();

          if (updatedFile) {
            const result = {
              data: updatedFile,
            }
            return response.ok(res, result);
          } else {
            throw new Error('Patch failed!');
          }
        }
      }
    }
    catch (err) {
      RequestFilesController.handleServerError(req, res, err);
    }
  },

  patchRequestFile: async (req: express.Request, res: express.Response, patchType) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestFiles = await RequestFilesController.getModel(req, res);
        let requestFile = await RequestFiles.findById(req.params._id);

        if (!requestFile) {
          return response.fail_notFound(res);
        } else {
          const status = requestFile.status;
          switch (patchType) {
            case 'mark':
              if (status==='Unmarked'){
                requestFile.status = 'Marked';
              }
              break;

            case 'unmark':
              if (status==='Marked'){
                requestFile.status = 'Unmarked';
              }
              break;

            default:
              break;
          }
          let updatedFile = await requestFile.save();
          if (updatedFile) {
            const result = {
              data: updatedFile,
            }
            return response.ok(res, result);
          } else {
            throw new Error('Patch failed!');
          }
        }
      }
    }
    catch (err) {
      RequestFilesController.handleServerError(req, res, err);
    }
  },

  markRequestFile: async (req: express.Request, res: express.Response) => {
    RequestFilesController.patchRequestFile(req, res, 'mark');
  },

  unmarkRequestFile: async (req: express.Request, res: express.Response) => {
    RequestFilesController.patchRequestFile(req, res, 'unmark');
  },

  deleteRequestFile: async (req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln18';

      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestFiles = await RequestFilesController.getModel(req, res);
        let requestFiles = await RequestFiles.findById(req.params._id);

        if (!requestFiles) {
          return response.fail_notFound(res);
        } else {
          if (requestFiles.status == 'Marked') {
            let removedFile = await requestFiles.remove();
            if (removedFile) {
              // console.log(removedClient);
              // const trackParams = {
              //   multi: false,
              //   tcode: tcode,
              //   oldData: removedClient.toObject(),
              //   newData: {_id:''}
              // }
              // let trackHistory = GkClientsController.trackHistory(req, res, trackParams);

              const result = {
                data: removedFile,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Remove failed!');
            }
          } else {
            const result = {
              message: 'Only marked document could be deleted!',
              data: {},
            }
            return response.fail_preCondition(res, result);
          }

        }
      }
    }
    catch (err) {
      RequestFilesController.handleServerError(req, res, err);
    }
  },

  handleServerError: async(req: express.Request, res: express.Response, error) => {
    const result = {
      message: error['message'] || '',
      data: error['data'] || []
    }
    return response.fail_serverError(res, result);
  },

}

module.exports = RequestFilesController;
