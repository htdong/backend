import express = require("express");
Promise = require("bluebird");
var fs = require("fs");
var json2csv = require('json2csv');
var fastCSV = require('fast-csv');
var deep = require('deep-diff').diff;

import  { HelperService } from '../../services/helper.service';

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");

var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');
var FilesService = require('../../services/files.service');

var GkClientSchema = require('./gkClient.schema');
var GkClientRequestSchema = require('./gkClientRequest.schema');
var GkClientDashboardSchema = require('./gkClientDashboard.schema');
var GkClientHistorySchema = require('./gkClient.history.schema');

var DashboardItemsSchema = require('../dashboard/dashboardItem.schema');

var GkClientsController = {

  /*****************************************************************************
   * INDIVIDUAL PROCESSING
   *****************************************************************************/

  /**
  * @function module11
  * Create new document for (module) collection
  * Corresonding tcode = module + 11
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 201
  * - 412
  *   + Key duplication error
  *   + Validation failed
  *   + Key duplication error || Validation failed
  * - 500
  */
  module11: async(req: express.Request, res: express.Response) => {
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
        data: {_id: client._id }
      }
      return response.ok_created(res, result);
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
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
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module13
  * Update a document in (module) collection
  * Corresonding tcode = module + 13
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 400 (Invalid Id)
  * - 404 (Not Found)
  * - 412
  *   + Key duplication error
  *   + Validation failed
  *   + Key duplication error || Validation failed
  * - 500
  */
  module13: async(req: express.Request, res: express.Response) => {
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
          client.industry = req.body.industry;
          client.service = req.body.service;
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
            throw new Error('Put failed!');
          }
        }
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  /**
  * @function module14
  * Disable a document in (module) collection
  * Corresonding tcode = module + 14
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
  module14: async(req: express.Request, res: express.Response) => {
    try {
      return GkClientsController.patch(req, res, 'disable');
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module15
  * Enable a document in (module) collection
  * Corresonding tcode = module + 15
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
  module15: async(req: express.Request, res: express.Response) => {
    try {
      return GkClientsController.patch(req, res, 'enable');
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module16
  * Mark a document in (module) collection
  * Corresonding tcode = module + 16
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
  module16: async(req: express.Request, res: express.Response) => {
    try {
      return GkClientsController.patch(req, res, 'mark');
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module17
  * Unmark a document in (module) collection
  * Corresonding tcode = module + 17
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
  module17: async(req: express.Request, res: express.Response) => {
    try {
      return GkClientsController.patch(req, res, 'unmark');
    }
    catch (err) {
      return response.handle_server_error(res, err);
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
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module19
  * View changes history of a document in (module) collection
  * Corresonding tcode = module + 19
  * LAZY FUNCTION
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 400 (Invalid Id)
  * - 500
  */
  module19: async(req: express.Request, res: express.Response) => {
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
      return response.handle_server_error(res, err);
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
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module21
  * Upload list of documents into (module) collection
  * Corresonding tcode = module + 21
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200 @linkTo @function processCollectionOfValidatedDocument
  * - 412
  * - 500
  */
  module21: async(req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln21';

      let validatedResult = await GkClientsController.validateData(req, res, 'upload');
      console.log(validatedResult);

      if (validatedResult['error'].length) {
        console.log('With error!', validatedResult['error'].length);
        return response.handle_failed_precondition(res, validatedResult);
      } else {
        console.log('No error!');
        GkClientsController.processCollectionOfValidatedDocument(req, res, tcode, validatedResult);
      }
    }
    catch(error) {
      return response.handle_server_error(res, error);
    }
  },

  /**
  * @function module22
  * Download list of all documents to CSV file
  * Corresonding tcode = module + 22
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200 @linkTo @function downloadCSV
  * - 500
  */
  module22: async(req: express.Request, res: express.Response) => {
    try {
      console.log('...[1]Process Database JSON to CSV');

      // Follow order of schema to easily update change
      let fields = [
        '_id',
        'name',
        'clientDb',
        'industry',
        'service',
        'addresses',
        'contacts',
        'solutions',
        'remarks',
        'status1',
        'status2',
        'created_at',
        'updated_at'
      ];

      let GkClient = await GkClientsController.getModel(req, res);
      let clients = await GkClient.find({});

      let csv = json2csv({data: clients, fields: fields});
      // console.log(csv);

      console.log('...[2]Generate temporary file for download');
      let fileService = new FilesService();
      return fileService.downloadCSV(req, res, csv);

    }
    catch (error) {
      error['data'] = "Download failed";
      return response.handle_server_error(res, error);
    }
  },

  /**
  * @function module23
  * Upsert list of documents into (module) collection
  * Corresonding tcode = module + 23
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200 @linkTo @function processCollectionOfValidatedDocument
  * - 412
  * - 500
  */
  module23: async(req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln23';

      let validatedResult = await GkClientsController.validateData(req, res, 'upsert');
      console.log(validatedResult);

      if (validatedResult['error'].length) {
        console.log('With error!', validatedResult['error'].length);
        return response.handle_failed_precondition(res, validatedResult);
      } else {
        console.log('No error!');
        // return response.ok(res, {});
        GkClientsController.processCollectionOfValidatedDocument(req, res, tcode, validatedResult);
      }
    }
    catch(error) {
      return response.handle_server_error(res, error);
    }
  },

  /**
  * @function module24
  * Disable documents of (module) collection in uploaded list
  * Corresonding tcode = module + 24
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200 @linkTo @function patchCollective
  * - 500
  */
  module24: async(req: express.Request, res: express.Response) => {
    try {
      return GkClientsController.patchCollective(req, res, 'disable');
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module25
  * Enable documents of (module) collection in uploaded list
  * Corresonding tcode = module + 25
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200 @linkTo @function patchCollective
  * - 500
  */
  module25: async(req: express.Request, res: express.Response) => {
    try {
      return GkClientsController.patchCollective(req, res, 'enable');
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module26
  * Mark documents of (module) collection in uploaded list
  * Corresonding tcode = module + 26
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200 @linkTo @function patchCollective
  * - 500
  */
  module26: async(req: express.Request, res: express.Response) => {
    try {
      return GkClientsController.patchCollective(req, res, 'mark');
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module27
  * Unmark documents of (module) collection in uploaded list
  * Corresonding tcode = module + 27
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200 @linkTo @function patchCollective
  * - 500
  */
  module27: async(req: express.Request, res: express.Response) => {
    try {
      return GkClientsController.patchCollective(req, res, 'unmark');
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module28
  * Delete documents of (module) collection in uploaded list
  * Corresonding tcode = module + 28
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200 @linkTo @function patchCollective
  * - 412
  * - 500
  */
  module28: async(req: express.Request, res: express.Response) => {
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
            return response.handle_failed_precondition(res, validatedResult);
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
      return response.handle_server_error(res, error);
    }
  },

  /**
  * @function module29
  * List of changes history of all documents in (module) collection by time sequence
  * Corresonding tcode = module + 29
  * LAZY FUNCTION
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 500
  */
  module29: async(req: express.Request, res: express.Response) => {
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
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module31 - Intentionally Not Used
  */
  // module31: async(req: express.Request, res: express.Response) => {
  //   try {
  //     return response.ok_pagination(res, {});
  //
  //   }
  //   catch (err) {
  //     return response.handle_server_error(res, err);
  //   }
  // },

  /**
  * @function module32
  * Get the document of (module request) collection for workflow purpose
  * If the document does not exist, create new document with specified Id
  * Corresonding tcode = module + 32
  *
  * @param {express.Request} req
  * - @param {string} Id
  * @param {express.Response} res
  *
  * @return {response}
  * - 400
  * - 200
  * - 500
  */
  module32: async(req: express.Request, res: express.Response) => {
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
            industry: '',
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
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module33
  * Update the document of (module request) collection in workflow
  * Corresonding tcode = module + 33
  *
  * @param {express.Request} req
  * - @param {string} Id
  * @param {express.Response} res
  *
  * @return {response}
  * - 400
  * - 404
  * - 200
  * - 500
  */
  module33: async(req: express.Request, res: express.Response) => {
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
  * @function module39
  * Get the list of changes history of the document request
  * TODO: Check the design to keep changes history of request document here or at request level
  * Corresonding tcode = module + 39
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 500
  */
  module39: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});

    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module3x
  * List of document in (request) collection that concern the (module) requests only
  * This is to supoort in module requests management and administration
  * Availabile functions are limited to Viewer, Super User, Admin, Auditor roles Only
  * - 32: View (Calling get data from request32 and module32) - Viewer
  * - 39: Audit changes history - Auditor
  * - 41 (CreateJournal), 42 (Post), 43 (Revert) - Super User
  * - 44 (ChangeApproval), 45 (ChangeStatus) - Admin
  *
  * TODO: Review the design to ensure
  * - 32, 41, 42, 43, 44, 45 in Client side is to open the request with body is (module) document
  * - 32 is for getting document for viewing only
  * - 41 is to create and save a new journal for request of (module) document
  * - 42 allow Super User to create journal entry by copying request journal to accounting journal
  * - 43 is to revert 42 transaction
  * - 44 and 45 should happen at (request) collection, rather than (module) collection
  * Corresonding tcode = module + 39
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 500
  */
  module3x: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});

    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module41
  * Super User to save or upsert Journal for request of (module) document
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 500
  */
  module41: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module42
  * Super User to post Journal of request of (module) document to accounting journal book
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 500
  */
  module42: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});

    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module43
  * Super User to revert journal of request of (module) document from accounting journal book
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 500
  */
  module43: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});

    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module44 - Intentionally Not Used
  * Admin to override existing PIC by another person to support continuity of process
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 500
  */
  // module44: async(req: express.Request, res: express.Response) => {
  //   try {
  //     return response.ok_pagination(res, {});
  //   }
  //   catch (err) {
  //     return response.handle_server_error(res, err);
  //   }
  // },

  /**
  * @function module45 - Intentionally Not Used
  * Admin to override existing status of request by another status
  * to support incident or formalize manual request flow
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 500
  */
  // module45: async(req: express.Request, res: express.Response) => {
  //   try {
  //     return response.ok_pagination(res, {});
  //
  //   }
  //   catch (err) {
  //     return response.handle_server_error(res, err);
  //   }
  // },

  /**
  * @function module51
  * Create new document of (module dashboard) collection
  * Corresonding tcode = module + 51
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 201
  * - 412
  *   + Key duplication error
  *   + Validation failed
  *   + Key duplication error || Validation failed
  * - 500
  */
  module51: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module52
  * Retrieve a document of (module dashboard) collection
  * Corresonding tcode = module + 52
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
  module52: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module53
  * Update a document of (module dashboard) collection
  * Corresonding tcode = module + 53
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
  module53: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});

    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module58
  * Delete a document in (module dashboard) collection
  * Corresonding tcode = module + 58
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
  module58: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module5x
  * List of document in (module dashboard) collection
  * Corresonding tcode = module + 5x
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
  module5x: async(req: express.Request, res: express.Response) => {
    try {
      let GkClientDashboard = await GkClientsController.getDashboardModel(req, res);
      let params = req.query;
      console.log(params);
      // console.log(req['mySession'].username);

      let query = {
        $and: [
          {name: {'$regex': params.filter, '$options' : 'i'}},
          {
            $or: [
              {type: 'Public'},
              {
                $and: [
                  {type: 'Private'},
                  {creator: req['mySession'].username}
                ]
              },
            ]
          }
        ]
      };

      let options = {
        select: '_id name type creator status1 status2',
        sort: JSON.parse(params.sort),
        lean: false,
        offset: parseInt(params.first),
        limit: parseInt(params.rows)
      };

      let dashboard = await GkClientDashboard.paginate(query, options);
      const result = {
        data: dashboard.docs,
        total: dashboard.total,
      }
      return response.ok_pagination(res, result);
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module61
  * Create new document of (module report) collection - Summary Report
  * Corresonding tcode = module + 61
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 201
  * - 412
  *   + Key duplication error
  *   + Validation failed
  *   + Key duplication error || Validation failed
  * - 500
  */
  module61: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module62
  * Retrieve a document of (module report) collection - Summary Report
  * Corresonding tcode = module + 62
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
  module62: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});

    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module63
  * Update a document of (module report) collection - Summary Report
  * Corresonding tcode = module + 63
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
  module63: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});

    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module68
  * Delete a document in (module report) collection - Summary Report
  * Corresonding tcode = module + 68
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
  module68: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module6x
  * List of document in (module report) collection - Summary Report
  * Corresonding tcode = module + 6x
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
  module6x: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module71
  * Create new document of (module report) collection - Detail Report
  * Corresonding tcode = module + 71
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 201
  * - 412
  *   + Key duplication error
  *   + Validation failed
  *   + Key duplication error || Validation failed
  * - 500
  */
  module71: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module72
  * Retrieve a document of (module report) collection - Detail Report
  * Corresonding tcode = module + 72
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
  module72: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module73
  * Update a document of (module report) collection - Detail Report
  * Corresonding tcode = module + 73
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
  module73: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module78
  * Delete a document in (module report) collection - Detail Report
  * Corresonding tcode = module + 78
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
  module78: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function module7x
  * List of document in (module report) collection - Detail Report
  * Corresonding tcode = module + 7x
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
  module7x: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function lazyDataForFormControl
  * Retrieve document in simplest form {id, name} for form control (autocomplete)
  * Public API
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
  lazyDataForFormControl: async(req: express.Request, res: express.Response) => {
    try {
      let GkClient = await GkClientsController.getModel(req, res);

      let params = req.query;
      console.log(params);

      let query = {
        $and: [
          {name: {'$regex': params.filter, '$options' : 'i'}},
          {status1: 'Active'},
          {status2: 'Unmark'}
        ]
      };

      let options = {
        select: '_id name',
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
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function listDataForFormControl
  * Retrieve all documents in simplest form {id, name} for form control (autocomplete)
  * Public API
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 500
  */
  listDataForFormControl: async(req: express.Request, res: express.Response) => {
    try {
      let GkClient = await GkClientsController.getModel(req, res);

      let params = req.query;
      console.log(params);

      let query = {
        $and: [
          {status1: 'Active'},
          {status2: 'Unmark'}
        ]
      };      

      let clients = await GkClient.find(query).select('_id name').sort({ name: 1 });
      const result = {
        data: clients.docs,
        total: clients.total,
      }
      return response.ok_pagination(res, result);
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },

  /**
  * MONGOOSE MODEL
  * Return a document model that is dynalically attachable to target database
  * @function getModel                  GkClient (1-, 2-, )
  * @function getHistoryModel           GkClientHistory (1-, 2-)
  * @function getRequestModel           GkClientRequest (3-)
  * @function getRequestJournalModel    GkClientRequestJournal (4-)
  * @function getRequestHistoryModel    GkClientRequestHistory (3-, 4-)
  * @function getDashboardModel         GkClientDashboard (5-)
  * @function getReportModel            GkClientReport (6-, 7-)

  * @function getDashboardItemsModel    DashboardItems (External)
  * @function getPropertyModel          Property (External)
  */

  getModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird")}
      );
      return systemDb.model('GkClient', GkClientSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
      // Deprecated
      // GkClientsController.handleServerError(req, res, err);
    }
  },

  getHistoryModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird") }
      );
      return systemDb.model('GkClientHistory', GkClientHistorySchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
    }
  },

  getRequestModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird") }
      );
      return systemDb.model('GkClientRequest', GkClientRequestSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
    }
  },

  getRequestJournalModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird") }
      );
      // TODO: Replace GkClientRequestSchema by GkClientRequestJournalSchema
      return systemDb.model('GkClientRequestJournal', GkClientRequestSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
    }
  },

  getRequestHistoryModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird") }
      );
      // TODO: Replace GkClientRequestSchema by GkClientRequestHistorySchema
      return systemDb.model('GkClientRequestHistory', GkClientRequestSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
    }
  },

  getDashboardModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird") }
      );
      return systemDb.model('GkClientDashboard', GkClientDashboardSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
    }
  },

  getReportModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird") }
      );
      // TODO: Replace GkClientDashboardSchema by GkClientReportSchema
      return systemDb.model('GkClientReport', GkClientDashboardSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
    }
  },

  getDashboardItemsModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird") }
      );
      return systemDb.model('DashboardItems', DashboardItemsSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
    }
  },

  getPropertyModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird") }
      );
      // TODO: Replace DashboardItemsSchema by PropertiesSchema
      return systemDb.model('Properties', DashboardItemsSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
    }
  },

  /**
  * SUPPORTING FUNCTIONS
  * @function trackHistory
  * @function patch
  * @function validateDate
  */

  /**
   * @function trackHistory
   * Track changes history of document
   *
   * @param {express.Request} req: express.Request that contain mySession
   * @param {express.Request} res: express.Response for responding the request in case
   * @param {} trackParams:        Paramaters for trackHistory process
   * - @param {boolean} multi:        Multiple changes? True: Multiple changes; False: Individual change
   * - @param {string} tcode:         The module and action corresponding to data change
   * - @param {any} oldData:          Data before changed
   * - @param {any} newData:          Data after changed
   * @var {} history:              Historical changes of data tracked in History Collection
   * @return {GkClientHistory}     Return the saved GkClientHistory document
   */

  trackHistory: async (req, res, trackParams) => {
    try {
      let GkClientHistory = await GkClientsController.getHistoryModel(req, res);
      let history;

      if (!trackParams.multi) {
        const id = trackParams.newData._id || trackParams.oldData._id;

        delete trackParams.oldData._id;
        delete trackParams.newData._id;
        delete trackParams.oldData.created_at;
        delete trackParams.newData.created_at;

        const diff = deep(trackParams.oldData, trackParams.newData);
        HelperService.log(diff);

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
      HelperService.log(history);

      let gkClientHistory = new GkClientHistory(history);
      return gkClientHistory.save();
    }
    catch (err) {
      console.log(err);
      return null;
    }
  },

  /**
  * @function patch
  * To execute patch a particular field of one document in collection, supporting:
  * - enable / disable
  * - mark / unmark
  *
  * @param {string} patchType:     One value in [disable, enable, mark, unmark]
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
      return response.handle_server_error(res, err);
    }
  },

  /**
  * @function validateDate
  * Function to traverse the uploaded file and validate list of documents to check their eligibility without saving
  * To validate uploaded data before mass processing
  *
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
                  // console.log(lineNumber, error.errors[Object.keys(error.errors)[0]].message);
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
  * @function processCollectionOfValidatedDocument
  * Function to process collection of validated documents via new or upsert
  *
  * @param {string} tcode                 To distinguish new or upsert tasks
  * @param {[GkClient]} validatedResult   Array of GkClient documents which passed validated step
  *
  * @return {response}
  */
  processCollectionOfValidatedDocument: async(req: express.Request, res: express.Response, tcode, validatedResult) => {
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
  * @function patchCollective
  * To update list of documents in collection, supporting:
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
          return response.handle_failed_precondition(res, validatedResult);
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
      return response.handle_server_error(res, error);
    }
  },

  /**
  * DEPRECATED
  */

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
      return response.handle_server_error(res, err);
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
      return response.handle_server_error(res, err);
    }
  },

  /*****************************************************************************************
   * COLLECTIVE PROCESSING
   *****************************************************************************************/



  /**
   * DASHBOARD - Return processed data for using
   */

  datasource: async(req: express.Request, res: express.Response) => {
    try {
      // IMPORTANT
      // req.query is always an object
      // if passing a pure array from client to server shall receive below object
      // {'0': 'status1', '1':'status2'}
      // and in order to cover object to array
      // => [status1, status2]
      // must use
      // let param_dimensions = Object.keys(dimensions).map((k) => dimensions[k]);

      let dimensions = req.query.dimensions;
      let measures = req.query.measures;
      console.log(dimensions);
      console.log(measures);

      // if invalid params, return error
      if ((!dimensions.length) || (!measures.length)) {
        return response.fail_badRequest(res, {});
      }

      let GkClient = await GkClientsController.getModel(req, res);

      /*************************************************************************
       * AGGREGATION STAGES DYNAMICAL GENERATION BASED ON DIMENSIONS AND MEASURE
       *
       *************************************************************************/
      // TODO: Change to current year
      const year = 2018;

      // Trend/ movement focus by adding month/ year fields for processing
      const addFields = {
        "month": {$month: "$created_at"},
        "year": {$year: "$created_at"}
      };

      // aggregation is done via group by dimensions and their sequences
      let group_id = {};

      // sort by dimensions and their sequences
      let sort = {};

      // concationate all dimensions by their sequence to create key
      let key = {};
      let arrConcat =[];

      // DYNAMICAL PROCESSING: dimensions are added by their sequences
      const lenParams = dimensions.length; // Performance to reduce length calculation
      for (let i=0; i<=lenParams-1; i++) {
        group_id[dimensions[i]] = "$" + dimensions[i];
        sort["_id." + dimensions[i]] = 1;
        arrConcat.push(dimensions[i],"-");
      }

      // MANUAL PROCESSING: add other manual processing
      group_id["month"] = {
        $cond: {
          if: {$gte: ["$year", year]},
          then: {$month: "$created_at"},
          else: 0
        }
      }
      sort["month"] = 1;
      arrConcat.push({$substr: ["$_id.month", 0, -1]});
      key = { "key": { $concat: arrConcat }};

      const group = { _id: group_id };
      measures.forEach((el) => {
        Object.assign(group, JSON.parse(el));
      });

      // DEBUG
      // console.log('addFields:', HelperService.log(addFields));
      // console.log('group:', HelperService.log(group));
      // console.log('sort:', HelperService.log(sort));
      // console.log('key:', HelperService.log(key));

      let datasource = await GkClient.aggregate([
        // Stage 1
    		{ $addFields: addFields },

        // Stage 2
    		{ $group: group },

        // Stage 3
    		{ $sort: sort },

        // Stage 4
    		{ $addFields: key }
      ]);

      // HelperService.log(datasource);

      const result = {
        data: datasource,
      }

      return response.ok(res, result);

    } catch(err) {
      return response.handle_server_error(res, err);
    }
  },

  getDashboardItems: async(req: express.Request, res: express.Response) => {
    try {
      const myModule = 'GkClients';
      let DashboardItems = await GkClientsController.getDashboardItemsModel(req, res);

      let data = await DashboardItems.findAll({module: myModule});

      const result = {
        data: data,
      }
      return response.ok(res, result);

    } catch(err) {
      return response.handle_server_error(res, err);
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
      return response.handle_server_error(res, err);
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
      return response.handle_server_error(res, err);
    }
  },

}; // End of module

module.exports = GkClientsController;
