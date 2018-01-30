import express = require("express");
Promise = require("bluebird");

var deep = require('deep-diff').diff;

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");

var ConstantsBase = require('../../config/base/constants.base');

var response = require('../../services/response.service');

var RequestApprovalSchema = require('./requestApproval.schema');
var RequestApprovalHistorySchema = require('./requestApproval.history.schema');
var StandardApprovers = require('./standardApprovers');

/*****************************************************************************************
 * REQUESTAPPROVAL CONTROLLER
 * @function findApprovalTypeByTcode
 *****************************************************************************************/
var RequestApprovalController = {
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
      return systemDb.model('RequestApproval', RequestApprovalSchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      RequestApprovalController.handleServerError(req, res, err);
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
      return systemDb.model('RequestApprovalHistory', RequestApprovalHistorySchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      RequestApprovalController.handleServerError(req, res, err);
    }
  },

  findStandardApprovalItems: async (req: express.Request, res: express.Response) => {
    const standardApprovalItems = [
      // Management by function and by DOA
      {
        fx: 'directManager',
        desc: 'Direct Manager',
        type: 'one',
      },
      {
        fx: 'departmentHead',
        desc: 'Department Head',
        type: 'one',
      },
      {
        fx: 'doaManager',
        desc: 'DOA Manager',
        type: 'many'
      },
      {
        fx: 'doaManagerExcludeDirectManager',
        desc: 'DOA Manager (upper D. Manager)',
        type: 'many'
      },
      {
        fx: 'doaManagers',
        desc: 'DOA Managers',
        type: 'many'
      },
      {
        fx: 'doaManagersExcludeDirectManager',
        desc: 'DOA Managers (upper D. Manager)',
        type: 'many'
      },

      // Business Partner by function and by DOV
      {
        fx: 'financeBusinessPartner',
        desc: 'Finance Business Partner',
        type: 'one',
      },
      {
        fx: 'dovFinanceBusinessPartner',
        desc: 'DOV Finance Business Partner',
        type: 'one',
      },
      {
        fx: 'dovFinanceBusinessPartners',
        desc: 'DOV Finance Business Partners',
        type: 'one',
      },

      {
        fx: 'hrBusinessPartner',
        desc: 'HR Business Partner',
        type: 'one',
      },

      // Fixed position
      {
        fx: 'chiefAccountant',
        desc: 'Chief Accountant',
        type: 'many',
      },
      {
        fx: 'chiefFinanceOfficer',
        desc: 'Chief Finance Officer',
        type: 'one',
      },
      {
        fx: 'chiefComplianceOfficer',
        desc: 'Chief Compliance Officer',
        type: 'one',
      },
      {
        fx: 'chiefHumanCapitalOfficer',
        desc: 'Chief Human Capital Officer',
        type: 'many',
      },
      {
        fx: 'chiefMarketingOfficer',
        desc: 'Chief Marketing Officer',
        type: 'one',
      },
      {
        fx: 'chiefExecutiveOfficer',
        desc: 'Chief Executive Officer',
        type: 'one',
      },
      {
        fx: 'generalManager',
        desc: 'General Manager',
        type: 'one',
      },
      {
        fx: 'generalDirector',
        desc: 'General Director',
        type: 'one',
      },

      // Functionality
      {
        fx: 'systemMasterData',
        desc: 'System MD Officer',
        type: 'one',
      },
      {
        fx: 'legalEntityMasterData',
        desc: 'Legal Entity MD Officer',
        type: 'one',
      },
      {
        fx: 'vendorMasterData',
        desc: 'Vendor MD Officer',
        type: 'one',
      },
      {
        fx: 'customerMasterData',
        desc: 'Customer MD Officer',
        type: 'one',
      }
    ];

    const result = {
      message: '',
      data: standardApprovalItems,
      total: standardApprovalItems.length
    }
    return response.ok(res, result);
  },

  findApprovalTypesByTcode: async (req: express.Request, res: express.Response) => {
    try {
      if (!req.params._id) {
        const result = {
          message: `${req.params._id} is required!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestApproval = await RequestApprovalController.getModel(req, res);
        let requestApproval = await RequestApproval.find({tcode: req.params._id});
        console.log(requestApproval);
        if (!requestApproval) {
          return response.fail_notFound(res);
        } else {
          const result = {
            message: '',
            data: requestApproval,
            total: requestApproval.length
          }
          return response.ok(res, result);
        }
      }
    }
    catch (err) {
      RequestApprovalController.handleServerError(req, res, err);
    }

    // const sample = [
    //   { _id: 'A11',
    //     desc: 'GKCLN31 | Standard',
    //     items: [
    //       {
    //         fx: 'direct_manager',
    //         desc: 'Direct Manager',
    //         type: 'one',
    //       },
    //       {
    //         fx: 'cfo',
    //         desc: 'Chief Finance Officer',
    //         type: 'many',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'A12',
    //     desc: 'GKCLN31 | Fast Track',
    //     items: [
    //       {
    //         fx: 'finance_business_partner',
    //         desc: 'Finance Business Partner',
    //         type: 'one',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'A13',
    //     desc: 'GKCLN31 | Exception',
    //     items: [
    //       {
    //         fx: 'chief_accountant',
    //         desc: 'Chief Accountant',
    //         type: 'many',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'B11',
    //     desc: 'GKCLN33 | Standard',
    //     items: [
    //       {
    //         fx: 'cho',
    //         desc: 'Chief Human Officer',
    //         type: 'many',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'B12',
    //     desc: 'GKCLN33 | Fast Track',
    //     items: [
    //       {
    //         fx: 'vendor_master_data',
    //         desc: 'Vendor MD Officer',
    //         type: 'many',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'B13',
    //     desc: 'GKCLN33 | Exception',
    //     items: [
    //       {
    //         fx: 'cmo',
    //         desc: 'Chief Marketing Officer',
    //         type: 'one',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    // ];
    //
    // const result = {
    //   message: '',
    //   data: sample,
    //   total: sample.length
    // }
    // return response.ok(res, result);
  },

  apiGetApprovalTypesListByTcode: async (req: express.Request, res: express.Response) => {
    try {
      if (!req.params._id) {
        const result = {
          message: `${req.params._id} is required!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestApproval = await RequestApprovalController.getModel(req, res);
        let requestApproval = await RequestApproval.find({
          tcode: req.params._id,
          status1: 'Active',
          status2: 'Unmarked'
        }).select('_id desc items');

        console.log(requestApproval);
        if (!requestApproval) {
          return response.fail_notFound(res);
        } else {
          const result = {
            message: '',
            data: requestApproval,
            total: requestApproval.length
          }
          return response.ok(res, result);
        }
      }
    }
    catch (err) {
      RequestApprovalController.handleServerError(req, res, err);
    }

    // const sample = [
    //   { _id: 'A11',
    //     desc: 'GKCLN31 | Standard',
    //     items: [
    //       {
    //         fx: 'direct_manager',
    //         desc: 'Direct Manager',
    //         type: 'one',
    //       },
    //       {
    //         fx: 'cfo',
    //         desc: 'Chief Finance Officer',
    //         type: 'many',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'A12',
    //     desc: 'GKCLN31 | Fast Track',
    //     items: [
    //       {
    //         fx: 'finance_business_partner',
    //         desc: 'Finance Business Partner',
    //         type: 'one',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'A13',
    //     desc: 'GKCLN31 | Exception',
    //     items: [
    //       {
    //         fx: 'chief_accountant',
    //         desc: 'Chief Accountant',
    //         type: 'many',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'B11',
    //     desc: 'GKCLN33 | Standard',
    //     items: [
    //       {
    //         fx: 'cho',
    //         desc: 'Chief Human Officer',
    //         type: 'many',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'B12',
    //     desc: 'GKCLN33 | Fast Track',
    //     items: [
    //       {
    //         fx: 'vendor_master_data',
    //         desc: 'Vendor MD Officer',
    //         type: 'many',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    //   { _id: 'B13',
    //     desc: 'GKCLN33 | Exception',
    //     items: [
    //       {
    //         fx: 'cmo',
    //         desc: 'Chief Marketing Officer',
    //         type: 'one',
    //       },
    //     ],
    //     status1: 'Active', status2: 'Marked', tcode: 'gkcln31'
    //   },
    // ];
    //
    // const result = {
    //   message: '',
    //   data: sample,
    //   total: sample.length
    // }
    // return response.ok(res, result);
  },

  createApprovalType: async (req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln92';

      req.body.status1 = 'Active';
      req.body.status2 = 'Unmarked';

      let RequestApproval = await RequestApprovalController.getModel(req, res);
      let requestApproval = new RequestApproval(req.body);

      let approvalType = await requestApproval.save();

      const trackParams = {
        multi: false,
        tcode: tcode,
        oldData: {_id:''},
        newData: requestApproval.toObject()
      }
      let trackHistory = RequestApprovalController.trackHistory(req, res, trackParams);

      const result = {
        message: 'Creation completed!',
        data: approvalType._id
      }
      return response.ok_created(res, result);
    }
    catch (err) {
      return response.handle_createOrSave(res, err);
    }
  },

  updateApprovalType: async (req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln92';

      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestApproval = await RequestApprovalController.getModel(req, res);
        let approvalType = await RequestApproval.findById(req.params._id);

        console.log(approvalType);
        if (!approvalType) {
          return response.fail_notFound(res);
        } else {
          // console.log(req.body);
          const oldApprovalType = JSON.stringify(approvalType);

          approvalType.desc = req.body.desc;
          approvalType.items = req.body.items;

          let updatedApprovalType = await approvalType.save();

          if (updatedApprovalType) {
            const trackParams = {
              multi: false,
              tcode: tcode,
              oldData: JSON.parse(oldApprovalType),
              newData: updatedApprovalType.toObject()
            }
            let trackHistory = RequestApprovalController.trackHistory(req, res, trackParams);

            const result = {
              data: updatedApprovalType,
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

  patchApprovalType: async (req: express.Request, res: express.Response, patchType) => {
    try {
      let tcode = 'gkcln92';

      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);

      } else {
        let RequestApproval = await RequestApprovalController.getModel(req, res);
        let requestApproval = await RequestApproval.findById(req.params._id);
        console.log(requestApproval);
        if (!requestApproval) {
          return response.fail_notFound(res);
        } else {
          const oldClient = JSON.stringify(requestApproval);

          switch (patchType) {
            case 'disable':
              tcode = 'gkcln14';
              requestApproval.status1 = 'Inactive';
              break;

            case 'enable':
              tcode = 'gkcln15';
              requestApproval.status1 = 'Active';
              break;

            case 'mark':
              tcode = 'gkcln16';
              requestApproval.status2 = 'Marked';
              break;

            case 'unmark':
              tcode = 'gkcln17';
              requestApproval.status2 = 'Unmarked';
              break;

            default:
              break;
          }

          let updatedRequestApproval = await requestApproval.save();

          if (updatedRequestApproval) {
            const trackParams = {
              multi: false,
              tcode: tcode,
              oldData: JSON.parse(oldClient),
              newData: updatedRequestApproval.toObject()
            }
            let trackHistory = RequestApprovalController.trackHistory(req, res, trackParams);

            const result = {
              data: updatedRequestApproval,
            }
            return response.ok(res, result);
          } else {
            throw new Error('Patch failed!');
          }

        }
      }

    }
    catch (err) {
      RequestApprovalController.handleServerError(req, res, err);
    }
  },

  disableApprovalType: async (req: express.Request, res: express.Response) => {
    RequestApprovalController.patchApprovalType(req, res, 'disable');
  },

  enableApprovalType: async (req: express.Request, res: express.Response) => {
    RequestApprovalController.patchApprovalType(req, res, 'enable');
  },

  markApprovalType: async (req: express.Request, res: express.Response) => {
    RequestApprovalController.patchApprovalType(req, res, 'mark');
  },

  unmarkApprovalType: async (req: express.Request, res: express.Response) => {
    RequestApprovalController.patchApprovalType(req, res, 'unmark');
  },

  deleteApprovalType: async (req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln92';

      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
        }
        return response.fail_badRequest(res, result);
      } else {
        let RequestApproval = await RequestApprovalController.getModel(req, res);
        let requestApproval = await RequestApproval.findById(req.params._id);
        if (!requestApproval) {
          return response.fail_notFound(res);
        } else {
          if (requestApproval.status2 == 'Marked') {
            let removedRequestApproval = await requestApproval.remove();
            if (removedRequestApproval) {
              // console.log(removedClient);
              const trackParams = {
                multi: false,
                tcode: tcode,
                oldData: removedRequestApproval.toObject(),
                newData: {_id:''}
              }
              let trackHistory = RequestApprovalController.trackHistory(req, res, trackParams);

              const result = {
                data: removedRequestApproval,
              }
              return response.ok(res, result);
            } else {
              throw new Error('Remove failed!');
            }
          } else {
            const result = {
              message: 'Only marked document could be deleted!',
              data: requestApproval,
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

  },

  trackHistory: async (req, res, trackParams) => {
    try {
      let RequestApprovalHistory = await RequestApprovalController.getHistoryModel(req, res);

      let history;

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

      console.log(history);

      let requestApprovalHistory = new RequestApprovalHistory(history);

      return requestApprovalHistory.save();
    }
    catch (err) {
      console.log(err);
    }
  },

  handleServerError: async(req: express.Request, res: express.Response, error) => {
    const result = {
      message: error['message'] || '',
      data: error['data'] || []
    }
    return response.fail_serverError(res, result);
  },

};
module.exports = RequestApprovalController;
