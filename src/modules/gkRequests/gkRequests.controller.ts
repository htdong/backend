import express = require("express");
Promise = require("bluebird");
var fs = require("fs");
var json2csv = require('json2csv');
var fastCSV = require('fast-csv');
var deep = require('deep-diff').diff;

var helperService = require('../../services/helper.service');
// import  { HelperService } from '../../services/helper.service';

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");

var DBConnect = require('../../services/dbConnect.service');
var ConstantsBase = require('../../config/base/constants.base');
var response = require('../../services/response.service');
var security = require('../../services/permission.service');

var GkRequestSchema = require('./gkRequest.schema');
var GkRequestHistorySchema = require('./gkRequest.history.schema');

var StandardApprovers = require('../requestApproval/standardApprovers');

var GkRequestsController = {

  /**
  * @function module11
  * Create new document for (request) collection
  * Corresonding tcode = module + 11
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 201
  * - 401
  * - 500
  */
  module11: async (req: express.Request, res: express.Response) => {
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

        // TODO: Save the first history

        // Return reult
        const result = {
          message: 'Creation completed!',
          data: createdRequest._id
        }
        return response.ok_created(res, result);
      }
    }
    catch (err) {
      return response.handle_createOrSaveError(res, err);
    }
  },

  /**
  * @function module12
  * Retrieve a document from (request) collection
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
  module12: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let GkRequest = await GkRequestsController.getModel(req, res);
        let client = await GkRequest.findById(req.params._id);
        helperService.log(client);
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
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function module13
  * Update a document in (request) collection
  * Corresonding tcode = module + 13
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {response}
  * - 200
  * - 400 (Invalid Id)
  * - 401
  * - 404 (Not Found)
  * - 500
  */
  module13: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!`}
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // helperService.log(gkRequest);

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
      return response.handle_createOrSaveError(res, err);
    }
  },

  /**
  * @function module19
  * View changes history of a document in (request) collection
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
  module19: async (req: express.Request, res: express.Response) => {
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
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function module1x
  * List of document in (request) collection
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
  module1x: async (req: express.Request, res: express.Response) => {
    try {
      let GkRequest = await GkRequestsController.getModel(req, res);
      let params = req.query;
      helperService.log(params);
      // helperService.log(req.headers.usr);
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

        case 'module':
          query = {
            $and: [
              {desc: {'$regex': params.filter, '$options' : 'i'}},
              {owner: username},
              {tcode: {'$regex': params.prefix, '$options' : 'i'}}
            ]
          };
          break;

        default:
          return response.fail_preCondition(res, {});
      }
      helperService.log(query);

      // TODO: Return data that fit to TRAY only, for better performance
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
      return response.fail_serverError(res, err);
    }
  },


  /**
  * REQUEST ACTIONS
  * @function submitRequest
  * @function withdrawRequest
  * @function cancelRequest
  * @function returnRequest
  * @function rejectRequest
  * @function approveRequest
  * @function abortRequest
  */

  submitRequest: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // helperService.log(gkRequest);

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
            // helperService.log(gkRequest);
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
      return response.handle_createOrSaveError(res, err);
    }
  },

  withdrawRequest: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // helperService.log(gkRequest);

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
      return response.handle_createOrSaveError(res, err);
    }
  },

  cancelRequest: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // helperService.log(gkRequest);

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
      return response.handle_createOrSaveError(res, err);
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
        helperService.log(gkRequest);

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
      return response.handle_createOrSaveError(res, err);
    }
  },

  rejectRequest: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        helperService.log(gkRequest);

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
      return response.handle_createOrSaveError(res, err);
    }
  },

  approveRequest: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        helperService.log(gkRequest);

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
      return response.handle_createOrSaveError(res, err);
    }
  },

  abortRequest: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!` }
        return response.fail_badRequest(res, result);
      } else {
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // helperService.log(gkRequest);

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
      return response.handle_createOrSaveError(res, err);
    }
  },

  /**
  * @function postRequest
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
  postRequest: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function revertRequest
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
  revertRequest: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function createRequestJournal
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
  createRequestJournal: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function postRequestJournal
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
  postRequestJournal: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function revertRequestJournal
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
  revertRequestJournal: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function moveRequestApproval
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
  moveRequestApproval: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * @function moveRequestStatus
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
  moveRequestStatus: async(req: express.Request, res: express.Response) => {
    try {
      return response.ok_pagination(res, {});
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * REQUEST APPROVAL FLOW
  */
  generateApprovalFlow: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!`}
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // helperService.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {

          // /**
          //  * SECURITY CHECK
          //  * - Logged user must have document tcode (req.body.tcode) in (req['mySession'].tcodes)
          //  * - Logged user (req['mySession'].username) must be in owner list (req.body.owner)
          //  *   User (req.body.owner) is used for test as (requestHeader) default will include logged user
          //  */
          // if (!(security.hasTcode(req, req.body.tcode) && security.isOwner(req.body.owner, req))) {
          //   return response.fail_forbidden(res);
          // }

          if (gkRequest.status === 'Draft') {

            let requestApprovalFunction = await GkRequestsController.getAprrovalFunction(gkRequest.approval_type.items);
            let requestApprovalFlow = [];
            await Promise.all(requestApprovalFunction).then((values) => {
              helperService.log(values);
              requestApprovalFlow = GkRequestsController.concatArrayOfObjects(values);
            });

            gkRequest.approval = requestApprovalFlow;

            let updatedGkRequest = await gkRequest.save();

            if (updatedGkRequest) {
              // Save update History

              const result = {
                data: updatedGkRequest['approval'],
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
      return response.handle_createOrSaveError(res, err);
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
    // helperService.log(approvalFunction);
    return Promise.resolve(approvalFunction);
  },

  inviteApprover: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!`}
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // helperService.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          // helperService.log(req.body);

          const invitedApprover = {
            type: 'o',
            username: req.body.approval.username,
            fullname: req.body.approval.fullname,
            step: req.body.approval.step,
            comment: '',
            decision: '',
            decided_at: ''
          }

          const approvalLength = gkRequest.approval.length;
          console.log(approvalLength, req.body.position);
          let newApproval = [];

          if (approvalLength > 0 ){
            gkRequest.approval = await helperService.insertItemInArray(gkRequest.approval, invitedApprover, req.body.position, req.body.approval.seq);
          } else {
            gkRequest.approval.push(invitedApprover);
          }

          const updatedGkRequest = await gkRequest.save();

          if (updatedGkRequest) {
            // Save update History

            const result = {
              data: updatedGkRequest['approval'],
            }
            return response.ok(res, result);
          } else {
            throw new Error('Inser Approver Failed!');
          }
        }

      }
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  removeApprover: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = { message: `${req.params._id} is invalid Id!`}
        return response.fail_badRequest(res, result);
      } else {
        // Retrieve document
        let GkRequest = await GkRequestsController.getModel(req, res);
        let gkRequest = await GkRequest.findById(req.params._id);
        // helperService.log(gkRequest);

        if (!gkRequest) {
          return response.fail_notFound(res);
        } else {
          // helperService.log(req.body);

          if (gkRequest.approval.indexOf(req.body.sequence)) {
            gkRequest.approval.splice(req.body.sequence, 1);
          }

          const updatedGkRequest = await gkRequest.save();

          if (updatedGkRequest) {
            // Save update History

            const result = {
              data: updatedGkRequest['approval'],
            }
            return response.ok(res, result);
          } else {
            throw new Error('Remove Approver Failed!');
          }
        }

      }
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /**
  * MONGOOSE MODEL
  * Return a document model that is dynalically attachable to target database
  * @function getModel                  GkRequest (1-)
  * @function getHistoryModel           GkRequestHistory (1-)
  */

  /**
  * @function getModel
  * To create a new mongoose model from GkRequest Schema/ Collection in systemDb
  *
  * @param {express.Request} req: express.Request that contain mySession
  * @param {express.Request} res: express.Response for responding the request in case
  *
  * @return {Mongoose Model} gkRequest
  */
  getModel: async (req: express.Request, res: express.Response) => {
    return DBConnect.connectSystemDB(req, res, 'GkRequest', GkRequestSchema);
  },

  /**
  * @function getHistoryModel
  * To create a new mongoose model from GkRequestHistory Schema/ Collection in systemDb
  *
  * @param {express.Request} req: express.Request that contain mySession
  * @param {express.Request} res: express.Response for responding the request in case
  *
  * @return {Mongoose Model} gkRequestHistory
  */
  getHistoryModel: async (req: express.Request, res: express.Response) => {
    return DBConnect.connectSystemDB(req, res, 'GkRequestHistory', GkRequestHistorySchema);
  },

  /**
  * SUPPORTING FUNCTIONS
  * @function trackHistory
  * @function isLastApprover
  * @function concatArrayOfObjects
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
  * @return {GkRequestHistory}     Return the saved GkClientHistory document
  */
  trackHistory: async (req, res, trackParams) => {
    try {
      let GkRequestHistory = await GkRequestsController.getHistoryModel(req, res);
      let history;

      if (!trackParams.multi) {
        const id = trackParams.newData._id || trackParams.oldData._id;

        delete trackParams.oldData._id;
        delete trackParams.newData._id;
        delete trackParams.oldData.created_at;
        delete trackParams.newData.created_at;

        const diff = deep(trackParams.oldData, trackParams.newData);
        helperService.log(diff);

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
      helperService.log(history);

      let gkRequestHistory = new GkRequestHistory(history);

      return gkRequestHistory.save();
    }
    catch (err) {
      helperService.log(err);
    }
  },

  /**
  * @function isLastApprover
  * Check the Request to find if stage is at last approver
  *
  * @param {GkRequest} gkRequest
  *
  * @return {boolean}
  */
  isLastApprover: (gkRequest) => {
    return ((gkRequest.next.length === 0) && (gkRequest.planned === gkRequest.pic.username));
  },

  /**
  * @function concatArrayOfObjects
  * Check the Request to find if stage is at last approver
  *
  * @param {} objectsArray
  *
  * @return {Array} approvalFlow
  */
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

}; // End of module

module.exports = GkRequestsController;
