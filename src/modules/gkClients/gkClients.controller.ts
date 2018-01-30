import express = require("express");
Promise = require("bluebird");
var fs = require("fs");
var json2csv = require('json2csv');
var fastCSV = require('fast-csv');
var deep = require('deep-diff').diff;

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");

var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');
var FilesService = require('../../services/files.service');

var GkClientSchema = require('./gkClient.schema');
var GkClientRequestSchema = require('./gkClientRequest.schema');
var GkClientHistorySchema = require('./gkClient.history.schema');

/*****************************************************************************************
 * GKCLIENT CONTROLLER
 * @function getModel         Return a document model that is dynalically attachable to target database
 * @function getHistoryModel  Return a document history model that is dynalically attachable to target database
 * @function trackHistory     Track change history of document
 *
 * @function create
 * @function findMasterListPagination Find Master List Pagination to support Datatable lazy loading
 * @function findById         To retrieve data of one document from collection by valid Id
 * @function update           To update data of one document in collection
 * @function patch            To patch a particular field of one document in collection, supporting:
 * - @function disable
 * - @function enable
 * - @function mark
 * - @function unmark
 * @function delete           To delete permanently a document from collection
 * @function viewChangeById   To get all historical change of particular document by Id
 *
 * @function validateData     To validate uploaded data before mass processing
 * @function handleFailedPrecondition To standardize response of pre-condition failed
 * @function handlePassedValidation To standardize response of success
 * @function handleServerError Function to standardize response of server error
 * @function upload           To upload list of new document into collection
 * @function download         To download the list of document to client
 * @function upsert           To upload and insert list of new document into collection
 * @function patchCollective  To patch list of documents in collection, supporting:
 * - @function disableCollective
 * - @function enableCollective
 * - @function markCollective
 * - @function unmarkCollective
 * @function deleteCollective To delete permanently list of documents from collection
 * @function history          To get all historical changes in Collection
 *
 * @function apiMasterList
 *****************************************************************************************/
var GkClientsController = {

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
      return systemDb.model('GkClient', GkClientSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      GkClientsController.handleServerError(req, res, err);
    }
  },

  getRequestModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        {
          useMongoClient: true,
          promiseLibrary: require("bluebird")
        }
      );
      return systemDb.model('GkClientRequest', GkClientRequestSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      GkClientsController.handleServerError(req, res, err);
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
      return systemDb.model('GkClientHistory', GkClientHistorySchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      GkClientsController.handleServerError(req, res, err);
    }
  },

  /**
   * Track change history of document
   *
   * @param {express.Request} req: express.Request that contain mySession
   * @param {express.Request} res: express.Response
   * @param {} trackParams:        Paramaters for trackHistory process
   * - @param {boolean} multi:        Multiple changes? True: Multiple changes; False: Individual change
   * - @param {string} tcode:         The module and action corresponding to data change
   * - @param {} oldData:             Data before changed
   * - @param {} newData:             Data after changed
   * @var {} history:              Historical changes of data tracked in History Collection
   */
  trackHistory: async (req, res, trackParams) => {
    try {
      // const systemDbUri = ConstantsBase.urlSystemDb;
      // const systemDb = await mongoose.createConnection(
      //   systemDbUri,
      //   {
      //     useMongoClient: true,
      //     promiseLibrary: require("bluebird")
      //   }
      // );
      // let GkClientHistory = systemDb.model('GkClientHistory', GkClientHistorySchema);
      let GkClientHistory = await GkClientsController.getHistoryModel(req, res);

      let history;
      if (!trackParams.multi) {
        const id = trackParams.newData._id || trackParams.oldData._id;

        delete trackParams.oldData._id;
        delete trackParams.newData._id;
        delete trackParams.oldData.created_at;
        delete trackParams.newData.created_at;

        const diff = deep(trackParams.oldData, trackParams.newData);
        console.log(diff);

        history = {
          docId: id,
          username: req['mySession']._id,
          tcode: trackParams.tcode,
          diff: diff
        }
      } else {
        history = {
          docId: '',
          username: req['mySession']._id,
          tcode: trackParams.tcode,
          diff: [{
            kind: 'U',
            path: '',
            lhs: '',
            rhs: trackParams.newData
          }]
        }
      }
      console.log(history);

      let gkClientHistory = new GkClientHistory(history);

      return gkClientHistory.save();
    }
    catch (err) {
      console.log(err);
    }
  },

  /*****************************************************************************************
   * INDIVIDUAL PROCESSING
   *****************************************************************************************/

  create: async (req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln11';

      req.body.status1 = 'Active';
      req.body.status2 = 'Unmarked';

      let GkClient = await GkClientsController.getModel(req, res);
      let gkClient = new GkClient(req.body);

      let client = await gkClient.save();

      const trackParams = {
        multi: false,
        tcode: tcode,
        oldData: {_id:''},
        newData: gkClient.toObject()
      }
      let trackHistory = GkClientsController.trackHistory(req, res, trackParams);

      const result = {
        message: 'Creation completed!',
        data: client._id
      }
      return response.ok_created(res, result);
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  findMasterListPagination: async (req: express.Request, res: express.Response) => {
    try {
      let GkClient = await GkClientsController.getModel(req, res);
      let params = req.query;
      console.log(params);

      let query = {
        $or: [
          {name: {'$regex': params.filter, '$options' : 'i'}},
          {clientDb: {'$regex': params.filter, '$options' : 'i'}}
        ]
      };

      let options = {
        select: '_id name clientDb status1 status2',
        sort: JSON.parse(params.sort),
        lean: false,
        offset: parseInt(params.first),
        limit: parseInt(params.rows)
      };

      let clients = await GkClient.paginate(query, options);
      const result = {
        data: clients.docs,
        total: clients.total,
      }
      return response.ok_pagination(res, result);
    }
    catch (err) {
      GkClientsController.handleServerError(req, res, err);
    }
  },

  findById: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.params._id);
        console.log(client);
        if (!client) {
          return response.fail_notFound(res);
        } else {
          const result = {
            message: '',
            data: client,
            total: 1
          }
          return response.ok(res, result);
        }
      }
    }
    catch (err) {
      GkClientsController.handleServerError(req, res, err);
    }
  },

  // For GkClient Request
  findOrCreateRequestById: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let GkClientRequest = await GkClientsController.getRequestModel(req, res);
        let gkClientRequest = await GkClientRequest.findById(req.params._id);
        console.log(gkClientRequest);
        if (!gkClientRequest) {

          const newGkClient = {
            _id: req.params._id,
            name: 'New GK Client',
            addresses: [],
            contacts: [],
            clientDb: req.params._id,
            remark: [],
            status1: 'Active',
            status2: 'Unmark'
          }

          console.log(newGkClient);

          gkClientRequest = new GkClientRequest(newGkClient);

          let createdClientRequest = await gkClientRequest.save();

          const result = {
            message: '',
            data: createdClientRequest,
            total: 1
          }
          return response.ok(res, result);

        } else {
          const result = {
            message: '',
            data: gkClientRequest,
            total: 1
          }
          return response.ok(res, result);
        }
      }
    }
    catch (err) {
      GkClientsController.handleServerError(req, res, err);
    }
  },

  // For GkClient Request
  findRequestById: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let GkClientRequest = await GkClientsController.getRequestModel(req, res);
        let client = await GkClientRequest.findById(req.params._id);
        console.log(client);
        if (!client) {
          return response.fail_notFound(res);
        } else {
          const result = {
            message: '',
            data: client,
            total: 1
          }
          return response.ok(res, result);
        }
      }
    }
    catch (err) {
      GkClientsController.handleServerError(req, res, err);
    }
  },

  update: async (req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln13';

      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.params._id);
        console.log(client);
        if (!client) {
          return response.fail_notFound(res);
        } else {
          // console.log(req.body);
          const oldClient = JSON.stringify(client);

          client.name = req.body.name;
          client.clientDb = req.body.clientDb;
          client.addresses = req.body.addresses;
          client.contacts = req.body.contacts;

          let updatedClient = await client.save();

          if (updatedClient) {
            const trackParams = {
              multi: false,
              tcode: tcode,
              oldData: JSON.parse(oldClient),
              newData: updatedClient.toObject()
            }
            let trackHistory = GkClientsController.trackHistory(req, res, trackParams);

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
      return response.handle_createOrSave(res, err);
    }
  },

  // For GkClient Request
  updateRequest: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        let GkClientRequest = await GkClientsController.getRequestModel(req, res);
        let gkClientRequest = await GkClientRequest.findById(req.params._id);
        console.log(gkClientRequest);
        if (!gkClientRequest) {
          return response.fail_notFound(res);
        } else {
          console.log(req.body);
          // const oldClient = JSON.stringify(client);

          gkClientRequest.name = req.body.name;
          gkClientRequest.clientDb = req.body.clientDb;
          gkClientRequest.addresses = req.body.addresses;
          gkClientRequest.contacts = req.body.contacts;

          let updatedGkClient = await gkClientRequest.save();

          if (updatedGkClient) {

            const result = {
              data: updatedGkClient,
            }
            return response.ok(res, result);
          } else {
            throw new Error('Update request body failed!');
          }
        }
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  /**
   * Patch - To update a particular field of one document in collection, supporting:
   * - enable / disable
   * - mark / unmark
   * @param {string} patchType:     One value in [disable, enable, mark, unmark]
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
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.params._id);
        console.log(client);
        if (!client) {
          return response.fail_notFound(res);
        } else {
          const oldClient = JSON.stringify(client);

          switch (patchType) {
            case 'disable':
              tcode = 'gkcln14';
              client.status1 = 'Inactive';
              break;

            case 'enable':
              tcode = 'gkcln15';
              client.status1 = 'Active';
              break;

            case 'mark':
              tcode = 'gkcln16';
              client.status2 = 'Marked';
              break;

            case 'unmark':
              tcode = 'gkcln17';
              client.status2 = 'Unmarked';
              break;

            default:
              break;
          }

          let updatedClient = await client.save();

          if (updatedClient) {
            const trackParams = {
              multi: false,
              tcode: tcode,
              oldData: JSON.parse(oldClient),
              newData: updatedClient.toObject()
            }
            let trackHistory = GkClientsController.trackHistory(req, res, trackParams);

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
      GkClientsController.handleServerError(req, res, err);
    }
  },

  disable: (req: express.Request, res: express.Response) => {
    GkClientsController.patch(req, res, 'disable');
  },

  enable: (req: express.Request, res: express.Response) => {
    GkClientsController.patch(req, res, 'enable');
  },

  mark: (req: express.Request, res: express.Response) => {
    GkClientsController.patch(req, res, 'mark');
  },

  unmark: (req: express.Request, res: express.Response) => {
    GkClientsController.patch(req, res, 'unmark');
  },

  delete: async(req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln18';

      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.params._id);
        if (!client) {
          return response.fail_notFound(res);
        } else {
          if (client.status2 == 'Marked') {
            let removedClient = await client.remove();
            if (removedClient) {
              // console.log(removedClient);
              const trackParams = {
                multi: false,
                tcode: tcode,
                oldData: removedClient.toObject(),
                newData: {_id:''}
              }
              let trackHistory = GkClientsController.trackHistory(req, res, trackParams);

              const result = {
                data: removedClient,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Remove failed!');
            }
          } else {
            const result = {
              message: 'Only marked document could be deleted!',
              data: client,
            }
            return response.fail_preCondition(res, result);
          }

        }
      }
    }
    catch (err) {
      GkClientsController.handleServerError(req, res, err);
    }
  },

  viewChangeById: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);
      } else {
        let GkClientHistory = await GkClientsController.getHistoryModel(req, res);
        let params = req.query;

        let query = {
          $and: [
              {docId: {'$regex': req.params._id, '$options' : 'i'} },
              // {multi: false } // TODO: or null to increase performance
          ]
        };

        let options = {
          select: 'created_at docId username tcode diff',
          sort: { created_at: -1 },
          lean: false,
          offset: parseInt(params.first),
          limit: parseInt(params.rows)
        };

        let history = await GkClientHistory.paginate(query, options);
        const result = {
          data: history.docs,
          total: history.total,
        }
        return response.ok_pagination(res, result);
      }

    }
    catch (err) {
      GkClientsController.handleServerError(req, res, err);
    }
  },

  /*****************************************************************************************
   * COLLECTIVE PROCESSING
   *****************************************************************************************/

  /**
   * Function to traverse the uploaded file and validate list of documents to check their eligibility without saving
   * @param {string} action:  One in [upload, upsert] - precondition check full schema
   * @return {} result:       ValidatedResult include:
   * - @return uploadStatus:    Status of uploaded file
   * - @return error:           Array of simplified error message
   * - @return data:            Array of documents eligible for action
   */
  validateData: async(req: express.Request, res: express.Response, action) => {
    try {
      console.log('...[1]Upload file to server');
      let fileService = new FilesService();
      let uploadStatus = await fileService.upload(req, res);

      console.log('...[2]Validate documents before creating/ updating Collection. Action = ' + action);
      let GkClient = await GkClientsController.getModel(req, res);

      let gkClient;
      let uploadFile = uploadStatus.data.path;
      let uploadData = [];
      let errArray = [];
      let lineNumber = 0;
      let validatedResult;

      var stream = fs.createReadStream(uploadFile);

      return new Promise((resolve, reject)=>{
        switch (action) {
          case 'upload':
          case 'upsert':
            fastCSV
             .fromStream(stream, { headers : true })
             .on("data", (data) => {

              /**
               * IMPORTANT:
               * - Upload will generate new _id
               * - Upsert keep old _id and only generate new _id for missing ones
               */
              if (action=='upload') {
                data['_id'] = new mongoose.Types.ObjectId();
              } else {
                if (!mongoose.Types.ObjectId.isValid(data['_id'])) {
                  data['_id'] = new mongoose.Types.ObjectId();
                }
              }
              gkClient = new GkClient(data);

              gkClient.validate((error) => {
                lineNumber = lineNumber + 1;
                if (error) {
                  errArray.push({
                    line: lineNumber,
                    error: error.errors[Object.keys(error.errors)[0]].message
                  });
                } else {
                  uploadData.push(data);
                }
              });

             })
             .on("end", () => {
               validatedResult = {
                uploadStatus: uploadStatus,
                error: errArray,
                data: uploadData,
               }
               resolve(validatedResult)
             });
            break;

          default: // No valid action
            validatedResult = {
              uploadStatus: uploadStatus,
              error: [{ line: 0, error: 'No valid action is defined for validation' }],
              data: [],
            }
            resolve(validatedResult)
            break;
          }

      });

    } catch(error) {
      const result = {
        uploadStatus: {},
        error: [{ line: 0, error: error }],
        data: [],
      }
      return Promise.resolve(result);
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
    let GkClient = await GkClientsController.getModel(req, res);
    let result;

    return new Promise((resolve, reject)=>{

      Promise
        .all(validatedResult['data'].map(item => {
          return GkClient.create(item).catch(error => ({error}))
        }))

        .then(items => {
          let errorArray = [];
          let count = 0;

          items.forEach(item => {
            count = count + 1;
            if (item['error']) {
              errorArray.push({ line: count, error: `Error: ${item['error'].errmsg}` });
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
  },

  /**
   * Upload - To upload list of new document into collection
   */
  upload: async(req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln21';

      let validatedResult = await GkClientsController.validateData(req, res, 'upload');
      console.log(validatedResult);

      if (validatedResult['error'].length) {
        GkClientsController.handleFailedPrecondition(req, res, validatedResult);
      } else {
        GkClientsController.handlePassedValidation(req, res, tcode, validatedResult);
      }

    }
    catch(error) {
      GkClientsController.handleServerError(req, res, error);
    }

  },

  /**
   * Download -  Download the list of document to client
   */
  download: async(req: express.Request, res: express.Response)=> {
    try {
      console.log('...[1]Process Database JSON to CSV');
      // console.log(req.query);

      // Follow order of schema to easily update change
      let fields = [
        '_id',
        'name',
        'addresses',
        'contacts',
        'solutions',
        'clientDb',
        'remarks',
        'status1',
        'status2'
      ];

      let GkClient = await GkClientsController.getModel(req, res);
      let clients = await GkClient.find({});

      let csv = json2csv({data: clients, fields: fields});
      // console.log(csv);

      // DIRECT DOWNLOAD VIA BLOB OR STREAM AT CLIENTSIDE
      /*
      res.set("Content-Disposition", "attachment; filename=gkClient.csv");
      res.set("Content-Type", "application/octet-stream");
      return res.send(csv);
      */

      // INDIRECT DOWNLOAD BY CREATING FILE AT SERVERSIDE FOR STATIC FILE SERVE
      /*
      const userfilename = req.query.filename || 'default';
      const filename = userfilename + '.csv';
      const path = '../repo/download/' + filename;
      fs.writeFile(path, csv, function(err) {
        if (err) throw err;
        console.log('Send file address to client for downloading');
        res.json({filename: filename});
      });
      */

      console.log('...[2]Generate temporary file for download');
      let fileService = new FilesService();
      return fileService.downloadCSV(req, res, csv);

    }
    catch (error) {
      error['data'] = "Download failed";
      GkClientsController.handleServerError(req, res, error);
    }

  },

  /**
   * Upsert - To upload and insert list of new document into collection
   */
  upsert: async(req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln23';

      let validatedResult = await GkClientsController.validateData(req, res, 'upload');
      console.log(validatedResult);

      if (validatedResult['error'].length) {
        GkClientsController.handleFailedPrecondition(req, res, validatedResult);
      } else {
        GkClientsController.handlePassedValidation(req, res, tcode, validatedResult);
      }

    }
    catch(error) {
      GkClientsController.handleServerError(req, res, error);
    }

  },

  /**
   * patchCollective - To update list of documents in collection, supporting:
   * @param {string} patchType  One in [disable, enable, mark, unmark]
   */
  patchCollective: async(req, res, patchType) => {
    try {
      console.log('...[1]Upload file to server');
      let fileService = new FilesService();
      let uploadStatus = await fileService.upload(req, res);

      console.log('...[2]Patching items in Database, type: ' + patchType);
      let GkClient = await GkClientsController.getModel(req, res);

      let uploadFile = uploadStatus.data.path;
      let lineNumber = 0;
      let uploadData = [];
      let errArray = [];

      let tcode;
      let data;
      switch (patchType) {
        case 'disable':
          tcode = 'gkcln24';
          data = {status1: 'Inactive'};
          break;

        case 'enable':
          tcode = 'gkcln25';
          data = {status1: 'Active'};
          break;

        case 'mark':
          tcode = 'gkcln26';
          data = {status2: 'Marked'};
          break;

        case 'unmark':
          tcode = 'gkcln27';
          data = {status2: 'Unmarked'};
          break;

        default:
          const result = {
            message: `${req.params._id} is invalid Id!`,
          }
          return response.fail_badRequest(res, result);
      }

      var stream = fs.createReadStream(uploadFile);

      fastCSV
       .fromStream(stream, { headers : true })

       .on("data", (data) => {
        // Validate uploaded data
        lineNumber = lineNumber + 1;
        if (mongoose.Types.ObjectId.isValid(data['_id'])) {
          uploadData.push(data['_id']);
        } else {
          errArray.push({
            line: lineNumber,
            error: data['_id']
          });
        }
       })

       .on("end", () => {

        const validatedResult = {
          uploadStatus: uploadStatus,
          error: errArray,
          data: uploadData,
        }
        console.log(validatedResult);

        if (validatedResult['error'].length) {
          GkClientsController.handleFailedPrecondition(req, res, validatedResult);
        } else {
          // custom success handler

          Promise.resolve()
          .then(() => {
            console.log(uploadData);
            console.log(data);
            return GkClient.update(
              {_id: { $in: uploadData} },
              data,
              { multi: true }
            );
          })

          .then(data => {
            console.log(data);

            let message = `${data.nModified} / ${data.n} items patched!`;
            let result = ({
              message: message,
              data: data,
            });

            if (data.nModified) {
              const filename = uploadStatus.data.path.split('/');
              const trackParams = {
                multi: true,
                tcode: tcode,
                oldData: {},
                newData: filename[filename.length - 1]
              }
              let trackHistory = GkClientsController.trackHistory(req, res, trackParams);
            }

            return response.ok_message(res, result);
          });
        }

       });

    }
    catch(error) {
      GkClientsController.handleServerError(req, res, error);
    }
  },

  disableCollective: (req: express.Request, res: express.Response) => {
    GkClientsController.patchCollective(req, res, 'disable');
  },

  enableCollective: (req: express.Request, res: express.Response) => {
    GkClientsController.patchCollective(req, res, 'enable');
  },

  markCollective: (req: express.Request, res: express.Response) => {
    GkClientsController.patchCollective(req, res, 'mark');
  },

  unmarkCollective: (req: express.Request, res: express.Response) => {
    GkClientsController.patchCollective(req, res, 'unmark');
  },

  /**
   * Delete - To delete permanently list of documents from collection
   */
  deleteCollective: async(req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln28';

      console.log('...[1]Upload file to server');
      let fileService = new FilesService();
      let uploadStatus = await fileService.upload(req, res);

      console.log('...[2]Remove items from Database');
      let GkClient = await GkClientsController.getModel(req, res);

      let uploadFile = uploadStatus.data.path;
      let lineNumber = 0;
      let uploadData = [];
      let errArray = [];

      var stream = fs.createReadStream(uploadFile);

      fastCSV
       .fromStream(stream, { headers : true })

       .on("data", (data) => {
          // Validate uploaded data
          lineNumber = lineNumber + 1;
          if (mongoose.Types.ObjectId.isValid(data['_id'])) {
            uploadData.push(data['_id']);
          } else {
            errArray.push({
              line: lineNumber,
              error: data['_id']
            });
          }

       })

       .on("end", () => {
          const validatedResult = {
            uploadStatus: uploadStatus,
            error: errArray,
            data: uploadData,
          }
          console.log(validatedResult);

          if (validatedResult['error'].length) {
            GkClientsController.handleFailedPrecondition(req, res, validatedResult);
          } else {
            // custom success handler
            Promise.resolve()
            .then(() => {
              console.log(uploadData);

              // IMPORTANT: Only "Marked" items to be removed
              return GkClient.remove(
                {
                  _id: { $in: uploadData},
                  status2: 'Marked'
                }
              );
            })

            .then(data => {
              console.log(data.result.n);
              let message = `${data.result.n} items removed!`;

              let result = ({
                data: {
                  message: message,
                  detail: data.result,
                }
              });

              if (data.result.n) {
                const filename = uploadStatus.data.path.split('/');
                const trackParams = {
                  multi: true,
                  tcode: tcode,
                  oldData: {},
                  newData: filename[filename.length - 1]
                }
                let trackHistory = GkClientsController.trackHistory(req, res, trackParams);
              }
              return response.ok_pagination(res, result);

            });

          }

       });

    }
    catch(error) {
      GkClientsController.handleServerError(req, res, error);
    }

  },

  history: async (req: express.Request, res: express.Response) => {
    try {
        let GkClientHistory = await GkClientsController.getHistoryModel(req, res);
        let params = req.query;

        let query = {};

        let options = {
          select: 'created_at docId username tcode diff',
          sort: { created_at: -1 },
          lean: false,
          offset: parseInt(params.first),
          limit: parseInt(params.rows)
        };

        let history = await GkClientHistory.paginate(query, options);
        const result = {
          data: history.docs,
          total: history.total,
        }
        return response.ok_pagination(res, result);

    }
    catch (err) {
      GkClientsController.handleServerError(req, res, err);
    }
  },

  /**
   * API - Return the master list for other module using
   */
  apiMasterList: async(req: express.Request, res: express.Response) => {
    try {
      let GkClient = await GkClientsController.getModel(req, res);

      let params = req.query;
      console.log(params);

      let query = {
        $and: [
          {name: {'$regex': params.filter, '$options' : 'i'}},
          {status1: 'Active'}
        ]
      };

      let options = {
        select: '_id name status1 status2',
        sort: { name: 1 },
        lean: false,
      };

      let clients = await GkClient.paginate(query, options);

      const result = {
        data: clients.docs,
      }
      return response.ok(res, result);

    }
    catch (err) {
      GkClientsController.handleServerError(req, res, err);
    }
  },

  /**
   * API - Return the master list for other module using via lazy
   */
  apiLazyMasterList: async(req: express.Request, res: express.Response) => {
    try {
      let GkClient = await GkClientsController.getModel(req, res);

      let params = req.query;
      console.log(params);

      let query = {
        $and: [
          {name: {'$regex': params.filter, '$options' : 'i'}},
          {status1: 'Active'}
        ]
      };

      let options = {
        select: '_id name status1 status2',
        sort: { name: 1 },
        lean: false,
        offset: parseInt(params.first),
        limit: parseInt(params.rows)
      };

      let clients = await GkClient.paginate(query, options);
      const result = {
        data: clients.docs,
        total: clients.total,
      }
      return response.ok_pagination(res, result);

    }
    catch (err) {
      GkClientsController.handleServerError(req, res, err);
    }
  }

}; // End of module

module.exports = GkClientsController;
