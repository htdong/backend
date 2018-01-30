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
var security = require('../../services/security.service');

var FilesService = require('../../services/files.service');

var GkRequestSchema = require('./gkRequest.schema');
var GkRequestHistorySchema = require('./gkRequest.history.schema');

var StandardApprovers = require('../requestApproval/standardApprovers');

/*****************************************************************************************
 * GKREQUEST CONTROLLER
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
var GkRequestsController = {

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
      return systemDb.model('GkRequest', GkRequestSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      GkRequestsController.handleServerError(req, res, err);
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
      return systemDb.model('GkRequestHistory', GkRequestHistorySchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      GkRequestsController.handleServerError(req, res, err);
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
      // let GkRequestHistory = systemDb.model('GkRequestHistory', GkRequestHistorySchema);
      let GkRequestHistory = await GkRequestsController.getHistoryModel(req, res);

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

      let gkRequestHistory = new GkRequestHistory(history);

      return gkRequestHistory.save();
    }
    catch (err) {
      console.log(err);
    }
  },

  /*****************************************************************************************
   * INDIVIDUAL PROCESSING
   *****************************************************************************************/

  createNew: async (req: express.Request, res: express.Response) => {
    try {
      let requestHeader = req.body;

      // Preparing request data
      delete requestHeader._id;
      requestHeader.status = 'Draft';

      requestHeader.owner = [req['mySession'].username];
      if (!requestHeader.owner.includes(requestHeader.requestor.username)) {
        requestHeader.owner.push(requestHeader.requestor.username);
      }

      /**
       * SECURITY CHECK
       * - Logged user must have document tcode (req.body.tcode) in (req['mySession'].tcodes)
       * - Logged user (req['mySession'].username) must be in owner list (req.body.owner)
       *   User (req.body.owner) is used for test as (requestHeader) default will include logged user
       */
      if (!(security.hasTcode(req, req.body.tcode) && security.isOwner(req.body.owner, req))) {
        return response.fail_forbidden(res);
      }
      else {
        // Create new request document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = new GkRequest(requestHeader);
        let createdRequest = await gkRequest.save();

        // Save the first history

        // Return reult
        const result = {
          message: 'Creation completed!',
          data: createdRequest._id
        }
        return response.ok_created(res, result);
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  findMasterListPagination: async (req: express.Request, res: express.Response) => {
    try {
      let GkRequest = await GkRequestsController.getModel(req, res);
      let params = req.query;
      console.log(params);
      // console.log(req.headers.usr);
      console.log();
      const username = req['mySession'].username;
      let query = {};

      switch (params.tray) {
        case 'inbox':
          query = {
            $and: [
              {desc: {'$regex': params.filter, '$options' : 'i'}},
              {'pic.username': username}
            ]
          };
          break;

        case 'outbox':
          query = {
            $and: [
              {desc: {'$regex': params.filter, '$options' : 'i'}},
              {approved: username}
            ]
          };
          break;

        case 'draft':
          query = {
            $and: [
              {desc: {'$regex': params.filter, '$options' : 'i'}},
              {owner: username},
              {status: 'Draft'}
            ]
          };
          break;

        case 'inprogress':
          query = {
            $and: [
              {desc: {'$regex': params.filter, '$options' : 'i'}},
              {owner: username},
              {status: { $in: ['In progress', 'P. Submit', 'P. Withdraw', 'P. Cancel', 'P. Abort']}}
            ]
          };
          break;

        case 'completed':
          query = {
            $and: [
              {desc: {'$regex': params.filter, '$options' : 'i'}},
              {owner: username},
              {status: { $in: ['Cancelled', 'Rejected', 'Approved', 'Aborted', 'Posted'] }}
            ]
          };
          break;

        default:
          return response.fail_preCondition(res, {});
      }
      console.log(query);


      let options = {
        select: '_id tcode desc status requestor owner step pic approved created_at updated_at',
        sort: JSON.parse(params.sort),
        lean: false,
        offset: parseInt(params.first),
        limit: parseInt(params.rows)
      };

      let clients = await GkRequest.paginate(query, options);
      const result = {
        data: clients.docs,
        total: clients.total,
      }
      return response.ok_pagination(res, result);
    }
    catch (err) {
      GkRequestsController.handleServerError(req, res, err);
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
        let GkRequest = await GkRequestsController.getModel(req, res);
        let client = await GkRequest.findById(req.params._id);
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
      GkRequestsController.handleServerError(req, res, err);
    }
  },

  update: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!`}
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // console.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          let requestHeader = req.body;
          // const oldRequest = JSON.stringify(gkRequest);

          requestHeader.owner = [req['mySession'].username];
          if (!requestHeader.owner.includes(requestHeader.requestor.username)) {
            requestHeader.owner.push(requestHeader.requestor.username);
          }

          /**
           * SECURITY CHECK
           * - Logged user must have document tcode (req.body.tcode) in (req['mySession'].tcodes)
           * - Logged user (req['mySession'].username) must be in owner list (req.body.owner)
           *   User (req.body.owner) is used for test as (requestHeader) default will include logged user
           */
          if (!(security.hasTcode(req, req.body.tcode) && security.isOwner(req.body.owner, req))) {
            return response.fail_forbidden(res);
          }
          else {
            // Update request document
            gkRequest.desc = requestHeader.desc;
            gkRequest.remark = requestHeader.remark;
            gkRequest.status = requestHeader.status;
            gkRequest.step = requestHeader.step;
            gkRequest.approval_type = requestHeader.approval_type;
            gkRequest.requestor = requestHeader.requestor;
            gkRequest.owner = requestHeader.owner;

            let updatedRequest = await gkRequest.save();

            if (updatedRequest) {
              // Save update history

              const result = {
                data: updatedRequest,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Patch failed!');
            }
          }
        }
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  submit: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // console.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          let requestHeader = req.body;
          // const oldClient = JSON.stringify(client);

          requestHeader.owner = [req['mySession'].username];
          if (!requestHeader.owner.includes(requestHeader.requestor.username)) {
            requestHeader.owner.push(requestHeader.requestor.username);
          }

          /**
           * SECURITY CHECK
           * - Logged user must have document tcode (req.body.tcode) in (req['mySession'].tcodes)
           * - Logged user (req['mySession'].username) must be in owner list (req.body.owner)
           *   User (req.body.owner) is used for test as (requestHeader) default will include logged user
           */
          if (!(security.hasTcode(req, req.body.tcode) && security.isOwner(req.body.owner, req))) {
            return response.fail_forbidden(res);
          }
          else {
            // Check control over sender for split conditions
            const controlSender = true;

            if (req['mySession'].username === gkRequest.requestor.username) {
              gkRequest.status = 'In progress';
              // Approval Example
              gkRequest.approved = ['approved'];
              gkRequest.pic = {
                username: 'gkpic',
                fullname: 'gkpic',
              };
              gkRequest.step = 'PIC to approve';
              gkRequest.planned = 'gkpic';
              gkRequest.next = ['approver1', 'approver2', 'lastapprover'];
            }
            else {
              gkRequest.status = 'P. Submit';
              // Approval Example
              gkRequest.approved = ['approved'];
              gkRequest.pic = requestHeader.requestor;
              gkRequest.step = 'Validation by requestor';
              gkRequest.planned = 'gkpic';
              gkRequest.next = ['approver1', 'approver2', 'lastapprover'];
            }

            // Update request document
            gkRequest.desc = requestHeader.desc;
            gkRequest.remark = requestHeader.remark;
            gkRequest.requestor = requestHeader.requestor;
            gkRequest.owner = requestHeader.owner;
            // console.log(gkRequest);
            let updatedRequest = await gkRequest.save();

            if (updatedRequest) {
              // Save update history

              const result = {
                data: updatedRequest,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Patch failed!');
            }
          }
        }
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  withdraw: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // console.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          /**
           * SECURITY CHECK
           * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
           * - Logged user (req['mySession'].username) must be in owner list (gkRequest.owner)
           */
          if (!(security.hasTcode(req, gkRequest.tcode) && security.isOwner(gkRequest.owner, req))) {
            return response.fail_forbidden(res);
          }
          else {
            // Check role of logged user to split condition
            if (req['mySession'].username === gkRequest.requestor.username) {
              gkRequest.status = 'Draft';
              gkRequest.step = '';
              gkRequest.approved = [];
              gkRequest.pic = {};
              gkRequest.next = [];
              gkRequest.planned = '';
            }
            else {
              gkRequest.status = 'P. Withdraw';
              gkRequest.pic = gkRequest.requestor;
            }

            // Update request document
            let updatedRequest = await gkRequest.save();

            if (updatedRequest) {
              // Save update history

              const result = {
                data: updatedRequest,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Patch failed!');
            }

          }

        }
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  cancel: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // console.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          /**
           * SECURITY CHECK
           * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
           * - Logged user (req['mySession'].username) must be in owner list (gkRequest.owner)
           */
          if (!(security.hasTcode(req, gkRequest.tcode) && security.isOwner(gkRequest.owner, req))) {
            return response.fail_forbidden(res);
          }
          else {
            // Check role of logged user to split condition
            if (req['mySession'].username === gkRequest.requestor.username) {
              gkRequest.status = 'Cancelled';
            }
            else {
              gkRequest.status = 'P. Cancel';
            }

            // Update request document
            let updatedRequest = await gkRequest.save();

            if (updatedRequest) {
              // Save update history

              const result = {
                data: updatedRequest,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Patch failed!');
            }
          }
        }
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  returnRequest: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        console.log('585', gkRequest);

        const tcode = gkRequest.tcode;

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          // Check status of request document to split condition
          switch (gkRequest.status) {
            case 'P. Submit':
              /**
               * SECURITY CHECK
               * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
               * - Logged user (req['mySession'].username)
               * + must be the requestor (gkRequest.requestor)
               * + must be in owner list (gkRequest.owner)
               * + must be the PIC (gkRequest.pic)
               */
              if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username) )) {
                return response.fail_forbidden(res);
              }
              else {
                // Reset to Draft
                gkRequest.status = 'Draft';

                gkRequest.approved = [];
                gkRequest.step = '';
                gkRequest.pic = {};
                gkRequest.next = [];
                gkRequest.planned = '';
              }
              break;

            case 'In progress':
              /**
               * SECURITY CHECK
               * - Logged user must be PIC
               */
              if (!security.isPIC(req, gkRequest.pic.username)) {
                return response.fail_forbidden(res);
              } else {
                // Reset to Draft
                gkRequest.status = 'Draft';

                gkRequest.step = '';
                gkRequest.approved = [];
                gkRequest.pic = {};
                gkRequest.next = [];
                gkRequest.planned = '';
              }
              break;

            case 'P. Withdraw':
            case 'P. Cancel':
              /**
               * SECURITY CHECK
               * SECURITY CHECK
               * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
               * - Logged user (req['mySession'].username)
               * + must be the requestor (gkRequest.requestor)
               * + must be in owner list (gkRequest.owner)
               * + must be the PIC (gkRequest.pic)
               */
              if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username) )) {
                return response.fail_forbidden(res);
              }
              else {
                gkRequest.status = 'In progress';

                // Reinforce the approval process
                // Example only
                gkRequest.pic = {
                  username: gkRequest.planned,
                  fullname: gkRequest.planned,
                };
              }
              break;

            case 'P. Abort':
              /**
               * SECURITY CHECK
               * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
               * - Logged user (req['mySession'].username)
               * + must be the requestor (gkRequest.requestor)
               * + must be in owner list (gkRequest.owner)
               * + must be the PIC (gkRequest.pic)
               */
              if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username) )) {
                return response.fail_forbidden(res);
              }
              else {
                gkRequest.status = 'Approved';
                gkRequest.pic = {};
              }
              break;

            default:
              return response.fail_badRequest(res);
          }

          // Update request document
          let updatedRequest = await gkRequest.save();

          if (updatedRequest) {
            // Save update history

            const result = {
              data: updatedRequest,
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

  reject: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        console.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          /**
           * SECURITY CHECK
           * - Logged user must be PIC
           */
          if (!security.isPIC(req, gkRequest.pic.username)) {
            return response.fail_forbidden(res);
          } else {
            // Update request document
            gkRequest.status = 'Rejected';
            gkRequest.approved.push(gkRequest.pic.username);
            gkRequest.pic = {};
            gkRequest.planned = '';
            let updatedRequest = await gkRequest.save();

            if (updatedRequest) {
              // Save update history

              const result = {
                data: updatedRequest,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Patch failed!');
            }
          }
        }
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  approve: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        console.log(gkRequest);

        const tcode = gkRequest.tcode;

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          // Check status of request document to split condition
          switch (gkRequest.status) {
            case 'P. Submit':
              /**
               * SECURITY CHECK
               * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
               * - Logged user (req['mySession'].username)
               * + must be the requestor (gkRequest.requestor)
               * + must be in owner list (gkRequest.owner)
               * + must be the PIC (gkRequest.pic)
               */
              if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username) )) {
                return response.fail_forbidden(res);
              }
              else {
                if (GkRequestsController.isLastApprover(gkRequest)) {
                  gkRequest.status = 'Approved';
                  // gkRequest.approved.push(gkRequest.pic.username);
                  gkRequest.pic = {};
                } else {
                  gkRequest.status = 'In progress';
                  // gkRequest.approved.push(gkRequest.pic.username);
                  gkRequest.pic = {
                    username: gkRequest.planned,
                    fullname: gkRequest.planned
                  }
                  if (gkRequest.next.length === 0) {
                    gkRequest.planned = '';
                  } else {
                    gkRequest.planned = gkRequest.next[0];
                    gkRequest.next.splice(0, 1);
                  }
                }
              }
              break;

            case 'In progress':
              /**
               * SECURITY CHECK
               * - Logged user must be PIC
               */
              if (!security.isPIC(req, gkRequest.pic.username)) {
                return response.fail_forbidden(res);
              } else {
                if (GkRequestsController.isLastApprover(gkRequest)) {
                  gkRequest.status = 'Approved';
                  gkRequest.approved.push(gkRequest.pic.username);
                  gkRequest.pic = {};
                  gkRequest.planned = '';
                } else {
                  gkRequest.status = 'In progress';
                  gkRequest.approved.push(gkRequest.pic.username);
                  gkRequest.pic = {
                    username: gkRequest.planned,
                    fullname: gkRequest.planned
                  }
                  if (gkRequest.next.length === 0) {
                    gkRequest.planned = '';
                  } else {
                    gkRequest.planned = gkRequest.next[0];
                    gkRequest.next.splice(0, 1);
                  }
                }
              }
              break;

            case 'P. Withdraw':
              /**
               * SECURITY CHECK
               * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
               * - Logged user (req['mySession'].username)
               * + must be the requestor (gkRequest.requestor)
               * + must be in owner list (gkRequest.owner)
               * + must be the PIC (gkRequest.pic)
               */
              if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username) )) {
                return response.fail_forbidden(res);
              }
              else {
                gkRequest.status = 'Draft';
                gkRequest.pic = {
                  username: gkRequest.planned,
                  fullname: gkRequest.planned
                }
              }
              break;

            case 'P. Cancel':
              /**
               * SECURITY CHECK
               * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
               * - Logged user (req['mySession'].username)
               * + must be the requestor (gkRequest.requestor)
               * + must be in owner list (gkRequest.owner)
               * + must be the PIC (gkRequest.pic)
               */
              if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username) )) {
                return response.fail_forbidden(res);
              }
              else {
                gkRequest.status = 'Cancelled';
                gkRequest.pic = {
                  username: gkRequest.planned,
                  fullname: gkRequest.planned
                }
              }
              break;

            case 'P. Abort':
              /**
               * SECURITY CHECK
               * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
               * - Logged user (req['mySession'].username)
               * + must be the requestor (gkRequest.requestor)
               * + must be in owner list (gkRequest.owner)
               * + must be the PIC (gkRequest.pic)
               */
              if (!(security.hasTcode(req, gkRequest.tcode) && security.isRequestor(req, gkRequest.requestor.username) && security.isOwner(gkRequest.owner, req) && security.isPIC(req, gkRequest.pic.username) )) {
                return response.fail_forbidden(res);
              }
              else {
                gkRequest.status = 'Aborted';
                gkRequest.pic = {};
              }
              break;

            default:
              return response.fail_badRequest(res);
          }

          // Update request document
          let updatedRequest = await gkRequest.save();

          if (updatedRequest) {
            // Save update history

            const result = {
              data: updatedRequest,
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

  isLastApprover(gkRequest) {
    return ((gkRequest.next.length === 0) && (gkRequest.planned === gkRequest.pic.username));
  },

  abort: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // console.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          /**
           * SECURITY CHECK
           * - Logged user must have document tcode (gkRequest.tcode) in (req['mySession'].tcodes)
           * - Logged user (req['mySession'].username) must be in owner list (gkRequest.owner)
           */
          if (!(security.hasTcode(req, gkRequest.tcode) && security.isOwner(gkRequest.owner, req))) {
            return response.fail_forbidden(res);
          }
          else {
            // Check role of logged user to split condition
            if (req['mySession'].username === gkRequest.requestor.username) {
              gkRequest.status = 'Aborted';
            }
            else {
              gkRequest.status = 'P. Abort';
            }

            // Update request document
            let updatedRequest = await gkRequest.save();

            if (updatedRequest) {
              // Save update history

              const result = {
                data: updatedRequest,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Patch failed!');
            }
          }
        }
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  generateApprovalFlow: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!`}
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // console.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          // var standardApprovers = {
          //   directManager: () => Promise.resolve([
          //     {
          //       type: 'm',
          //       approver: {
          //         username: 'directManager',
          //         fullname: 'Direct Manager'
          //       },
          //       step: 'Direct Manager',
          //       comment: '',
          //       decision: '',
          //       decided_at: ''
          //     }
          //   ])
          // }
          // var directManager = Promise.resolve([
          //   {
          //     type: 'm',
          //     approver: {
          //       username: 'directManager',
          //       fullname: 'Direct Manager'
          //     },
          //     step: 'Direct Manager',
          //     comment: '',
          //     decision: '',
          //     decided_at: ''
          //   }
          // ]);
          // let arrayApproval = [standardApprovers.directManager.call(null)];
          // console.log(arrayApproval);
          //
          // let data;
          // await Promise.all(arrayApproval).then((values) => {
          //   console.log(values);
          //   data = values;
          // });

          // let requestApprovalFunction = await GkRequestsController.getAprrovalFunction(gkRequest.approval_type.items);
          // await Promise.all(requestApprovalFunction).then((values) => {
          //   console.log(values);
          //   data = values;
          // });

          if (gkRequest.status === 'Draft') {

            let requestApprovalFunction = await GkRequestsController.getAprrovalFunction(gkRequest.approval_type.items);
            let requestApprovalFlow = [];
            await Promise.all(requestApprovalFunction).then((values) => {
              console.log(values);
              requestApprovalFlow = GkRequestsController.concatArrayOfObjects(values);
            });

            gkRequest.approval = requestApprovalFlow;

            let updatedGkRequest = await gkRequest.save();

            if (updatedGkRequest) {
              const result = {
                data: updatedGkRequest,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Patch failed!');
            }

          }

          // /**
          //  * SECURITY CHECK
          //  * - Logged user must have document tcode (req.body.tcode) in (req['mySession'].tcodes)
          //  * - Logged user (req['mySession'].username) must be in owner list (req.body.owner)
          //  *   User (req.body.owner) is used for test as (requestHeader) default will include logged user
          //  */
          // if (!(security.hasTcode(req, req.body.tcode) && security.isOwner(req.body.owner, req))) {
          //   return response.fail_forbidden(res);
          // }
          // else {
          //   // Update request document
          //   gkRequest.desc = requestHeader.desc;
          //   gkRequest.remark = requestHeader.remark;
          //   gkRequest.status = requestHeader.status;
          //   gkRequest.step = requestHeader.step;
          //   gkRequest.approvalType = requestHeader.approvalType;
          //   gkRequest.requestor = requestHeader.requestor;
          //   gkRequest.owner = requestHeader.owner;
          //
          //   let updatedRequest = await gkRequest.save();
          //
          //   if (updatedRequest) {
          //     // Save update history
          //
          //     const result = {
          //       data: updatedRequest,
          //     }
          //     return response.ok(res, result);
          //   } else {
          //     throw new Error('Patch failed!');
          //   }
          // }
        }
      }
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  getAprrovalFunction: async (approvalItems) => {
    let standardApprovers = {
      directManager: StandardApprovers.directManager.call(null),
      departmentHead: StandardApprovers.departmentHead.call(null),
      doaManager: StandardApprovers.doaManager.call(null),
      doaManagerExcludeDirectManager: StandardApprovers.doaManagerExcludeDirectManager.call(null),
      doaManagers: StandardApprovers.doaManagers.call(null),
      doaManagersExcludeDirectManager: StandardApprovers.doaManagersExcludeDirectManager.call(null),
      financeBusinessPartner: StandardApprovers.financeBusinessPartner.call(null),
      dovFinanceBusinessPartner: StandardApprovers.dovFinanceBusinessPartner.call(null),
      dovFinanceBusinessPartners: StandardApprovers.dovFinanceBusinessPartners.call(null),
      hrBusinessPartner: StandardApprovers.hrBusinessPartner.call(null),
      chiefAccountant: StandardApprovers.chiefAccountant.call(null),
      chiefFinanceOfficer: StandardApprovers.chiefFinanceOfficer.call(null),
      chiefComplianceOfficer: StandardApprovers.chiefComplianceOfficer.call(null),
      chiefHumanCapitalOfficer: StandardApprovers.chiefHumanCapitalOfficer.call(null),
      chiefMarketingOfficer: StandardApprovers.chiefMarketingOfficer.call(null),
      chiefExecutiveOfficer: StandardApprovers.chiefExecutiveOfficer.call(null),
      generalManager: StandardApprovers.generalManager.call(null),
      generalDirector: StandardApprovers.generalDirector.call(null),
      systemMasterData: StandardApprovers.systemMasterData.call(null),
      legalEntityMasterData: StandardApprovers.legalEntityMasterData.call(null),
      vendorMasterData: StandardApprovers.vendorMasterData.call(null),
      customerMasterData: StandardApprovers.customerMasterData.call(null),
    }

    let approvalFunction = [];
    let tmp = '';
    const count = approvalItems.length;
    for (let i=0; i < count; i++ ){
      tmp = standardApprovers[approvalItems[i].fx];
      approvalFunction.push(tmp);
    }
    // console.log(approvalFunction);
    return Promise.resolve(approvalFunction);
  },

  concatArrayOfObjects: (objectsArray) => {
    let approvalFlow = [];
    const iCount = objectsArray.length;
    for (let i=0; i < iCount; i++ ){
      const jCount = objectsArray[i].length;
      for (let j=0; j < jCount; j++) {
        approvalFlow.push(objectsArray[i][j]);
      }
    }
    return approvalFlow;
  },

  viewChangeById: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);
      } else {
        let GkRequestHistory = await GkRequestsController.getHistoryModel(req, res);
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

        let history = await GkRequestHistory.paginate(query, options);
        const result = {
          data: history.docs,
          total: history.total,
        }
        return response.ok_pagination(res, result);
      }

    }
    catch (err) {
      GkRequestsController.handleServerError(req, res, err);
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
      let GkRequest = await GkRequestsController.getModel(req, res);

      let gkRequest;
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
              gkRequest = new GkRequest(data);

              gkRequest.validate((error) => {
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
    let GkRequest = await GkRequestsController.getModel(req, res);
    let result;

    return new Promise((resolve, reject)=>{

      Promise
        .all(validatedResult['data'].map(item => {
          return GkRequest.create(item).catch(error => ({error}))
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
            let trackHistory = GkRequestsController.trackHistory(req, res, trackParams);
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

  history: async (req: express.Request, res: express.Response) => {
    try {
        let GkRequestHistory = await GkRequestsController.getHistoryModel(req, res);
        let params = req.query;

        let query = {};

        let options = {
          select: 'created_at docId username tcode diff',
          sort: { created_at: -1 },
          lean: false,
          offset: parseInt(params.first),
          limit: parseInt(params.rows)
        };

        let history = await GkRequestHistory.paginate(query, options);
        const result = {
          data: history.docs,
          total: history.total,
        }
        return response.ok_pagination(res, result);

    }
    catch (err) {
      GkRequestsController.handleServerError(req, res, err);
    }
  },

  /**
   * API - Return the master list for other module using
   */
  apiMasterList: async(req: express.Request, res: express.Response) => {
    try {
      let GkRequest = await GkRequestsController.getModel(req, res);

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

      let clients = await GkRequest.paginate(query, options);

      const result = {
        data: clients.docs,
      }
      return response.ok(res, result);

    }
    catch (err) {
      GkRequestsController.handleServerError(req, res, err);
    }
  },

  /**
   * API - Return the master list for other module using via lazy
   */
  apiLazyMasterList: async(req: express.Request, res: express.Response) => {
    try {
      let GkRequest = await GkRequestsController.getModel(req, res);

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

      let clients = await GkRequest.paginate(query, options);
      const result = {
        data: clients.docs,
        total: clients.total,
      }
      return response.ok_pagination(res, result);

    }
    catch (err) {
      GkRequestsController.handleServerError(req, res, err);
    }
  }

}; // End of module

module.exports = GkRequestsController;
