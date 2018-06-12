"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    getDashboardPageModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'DashboardPage', DashboardPageSchema);
    }),
    getDashboardItemModel: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectSystemDB(req, res, 'DashboardItem', DashboardItemSchema);
    }),
    action1x: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            let DashboardPage = yield DashboardController.getDashboardPageModel(req, res);
            let params = req.query;
            console.log(params);
            let query = {
                $or: [
                    { module: { '$regex': params.filter, '$options': 'i' } },
                    { type: { '$regex': params.filter, '$options': 'i' } },
                    { creator: { '$regex': params.filter, '$options': 'i' } },
                    { label: { '$regex': params.filter, '$options': 'i' } }
                ]
            };
            let options = {
                select: '_id module type creator label status1 status2',
                sort: JSON.parse(params.sort),
                lean: false,
                offset: parseInt(params.first),
                limit: parseInt(params.rows)
            };
            let dashboardPages = yield DashboardPage.paginate(query, options);
            const result = {
                data: dashboardPages.docs,
                total: dashboardPages.total,
            };
            return response.ok_pagination(res, result);
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    }),
    action12: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            let DashboardItems = yield DashboardController.getDashboardItemModel(req, res);
            console.log(req.params);
            let dashboardItems = yield DashboardItems.find({ module: req.params.id });
            const result = {
                data: dashboardItems,
            };
            return response.ok(res, result);
        }
        catch (err) {
            response.fail_serverError(res, err);
        }
    })
};
module.exports = DashboardController;
