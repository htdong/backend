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
const fs = require("fs");
const json2csv = require('json2csv');
const fastCSV = require('fast-csv');
const deep = require('deep-diff').diff;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");
const DBConnect = require('../../services/dbConnect.service');
const fileService = require('../../services/files.service');
const helperService = require('../../services/helper.service');
const mailService = require('../../services/mail.service');
const passwordService = require('../../services/password.service');
const response = require('../../services/response.service');
const simpleHash = require('../../services/simpleHash.service');
// import { log } from "util";
const UserSchema = require('./user.schema');
const UserHistorySchema = require('./user.history.schema');
const GkClientsController = require('../gkClients/gkClients.controller');
const GkClientSchema = require('../gkClients/gkClient.schema');
/**
 * USER CONTROLLER
 *
 * @function getModel
 *
 * @function authenticate
 * @function register
 * @function forgot
 *
 * @function ***
 */
const UsersController = {
    getModel: (req, res, clientDb) => __awaiter(this, void 0, void 0, function* () {
        return DBConnect.connectMasterDB(req, res, 'User', UserSchema, clientDb);
    }),
    /**
    * @function authenticate
    * Authenticate an user via (token), (email), (password)
    *
    * Steps:
    * [01] Validate inputs
    * [02] Connect systemDb to get gkClient via (token)
    * [03] Connect masterDb of gkClient to get user via (email)
    * [04] Authorize user via (password)
    * [05] Save session
    */
    authenticate: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            /* 01 */
            req.assert('email', 'Email is not valid').isEmail();
            req.assert('password', 'Password cannot be blank').notEmpty();
            req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
            const errors = req.validationErrors();
            if (errors || !mongoose.Types.ObjectId.isValid(req.body.token)) {
                req['myResult'] = {
                    code: 412,
                    message: 'Invalid inputs',
                    data: [errors, `${req.body.token} is invalid token!`]
                };
                return response.done(req, res);
            }
            /* 02 */
            let GkClient = yield GkClientsController.getModel(req, res);
            let client = yield GkClient.findById(req.body.token);
            if (!client) {
                return response.fail_notFound(res);
            }
            // helperService.log(client);
            /* 03 */
            let User = yield UsersController.getModel(req, res, client['clientDb']);
            let user = yield User.findOne({ email: req.body.email });
            if (!user) {
                return response.fail_notFound(res);
            }
            // helperService.log(user);
            /* 04 */
            const keyPassword = bcrypt.compareSync(req.body.password, user['hash']);
            const resetPassword = bcrypt.compareSync(req.body.password, user['resetHash']);
            const resetDate = new Date() < user['resetHashExpiry'];
            console.log(keyPassword, resetPassword, resetDate);
            if (keyPassword || (resetPassword && resetDate)) {
                // Generate JWT / AWT / Client and Sever session data
                const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET);
                const defaultLge = user.defaultLge || '';
                const awt = simpleHash.encode_array([
                    defaultLge,
                    new Date().getFullYear().toString(),
                ]);
                const encodedTcodes = simpleHash.encode_array(user.tcodes.sort());
                // data to pass back to frontend client
                const data = {
                    _id: user._id,
                    email: user.email,
                    token: token,
                    name: user['name'],
                    avatar: user.avatar,
                    gravatar: user.gravatar(),
                    awt: awt,
                    wklge: user.defaultLge,
                    wkyear: new Date().getFullYear().toString(),
                    lges: user.lges,
                    setting: client.setting,
                    tcodes: encodedTcodes
                };
                // helperService.log(data);
                /* 05 */
                // session to be stored for later use at backend server
                req['mySession'] = {
                    _id: user._id,
                    email: user.email,
                    clientId: req.body.token,
                    clientDb: client.clientDb,
                    wklge: user.defaultLge,
                    wkyear: new Date().getFullYear().toString(),
                    directmanager: user.directmanager,
                    department: user.department,
                    setting: client.setting,
                    tcodes: user.tcodes.sort(),
                };
                let sessionController = require('../session/session.controller');
                sessionController.set(req, res);
                // helperService.log(req['mySession']);
                return res.send(data);
            }
            else {
                return response.fail_unauthorized(res);
            } // End valid password
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function register
    * Register an user (token), (email) and (password)
    *
    * Steps:
    * [01] Validate inputs
    * [02] Connect systemDb to get gkClient via (token)
    * [03] Connect masterDb of gkClient to check existence of new user via (email)
    * [04] Save new user (email, password)
    */
    register: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            /* 01 */
            req.assert('email', 'Email is not valid').isEmail();
            req.assert('password', 'Password cannot be blank').notEmpty();
            req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
            const errors = req.validationErrors();
            if (errors || !mongoose.Types.ObjectId.isValid(req.body.token)) {
                req['myResult'] = {
                    code: 412,
                    message: 'Invalid inputs',
                    data: [errors, `${req.body.token} is invalid token!`]
                };
                return response.done(req, res);
            }
            /* 02 */
            let GkClient = yield GkClientsController.getModel(req, res);
            let client = yield GkClient.findById(req.body.token);
            if (!client) {
                return response.fail_notFound(res);
            }
            /* 03 */
            let User = yield UsersController.getModel(req, res, client['clientDb']);
            let users = yield User.find({ email: req.body.email });
            helperService.log(users);
            if (users.length > 0) {
                req['myResult'] = {
                    code: 412,
                    message: 'User is already exist!'
                };
                return response.done(req, res);
            }
            else {
                /* 04 */
                // Do not use below standard way as hash is initialized and required
                const hashedPassword = bcrypt.hashSync(req.body.password, 10);
                const hashedPasswordExpiry = new Date();
                hashedPasswordExpiry.setDate(hashedPasswordExpiry.getDate() - 1);
                const newUser = {
                    email: req.body.email,
                    avatar: "default.png",
                    hash: hashedPassword,
                    resetHash: hashedPassword,
                    resetHashExpiry: hashedPasswordExpiry,
                    status1: 'Active',
                    status2: 'Unmarked'
                };
                let clientUser = new User(newUser);
                let result = yield clientUser.save();
                return response.ok(res, { message: 'Completed!' });
            }
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function forgot
    * Reset password
    *
    * [01] Validate token
    * [02] Connect systemDb
    * [03] Get gkClient
    * [04] Connect masterDb of gkClient
    * [05] Get user of gkClient by username
    * [06] Save random password to user
    * [07] Reset password of user by sending new password to user email
    */
    forgot: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            /* 01 */
            req.assert('email', 'Email is not valid').isEmail();
            req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
            const errors = req.validationErrors();
            if (errors || !mongoose.Types.ObjectId.isValid(req.body.token)) {
                req['myResult'] = {
                    code: 412,
                    message: 'Invalid inputs',
                    data: [errors, `${req.body.token} is invalid token!`]
                };
                return response.done(req, res);
            }
            /* 02 */
            let GkClient = yield GkClientsController.getModel(req, res);
            let client = yield GkClient.findById(req.body.token);
            if (!client) {
                return response.fail_notFound(res);
            }
            let User = yield UsersController.getModel(req, res, client['clientDb']);
            let user = yield User.findOne({ email: req.body.email });
            // console.log('Users: ', users);
            if (!user) {
                return response.fail_notFound(res);
            }
            let tempPassword = passwordService.generate();
            // console.log(tempPassword);
            // user.hash = bcrypt.hashSync(tempPassword, 10);
            user.resetHash = bcrypt.hashSync(tempPassword, 10);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            user.resetHashExpiry = tomorrow;
            let modifiedUser = yield user.save();
            const mailContent = {
                subject: 'Forgot password request!',
                from: 'GK|BPS',
                textMessage: `Your reset password is: ${tempPassword}, valid until ${tomorrow}`,
                htmlMessage: `<b>Your reset password is:</b> <i>${tempPassword}<i>, valid until <i>${tomorrow}</i>`,
                to: modifiedUser.email
            };
            // helperService.log(mailContent);
            let result = yield mailService.send(res, mailContent);
            if (result.status == 200) {
                return response.ok(res, {});
            }
            else {
                return response.fail_serverError(res, result);
            }
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
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
    module1x: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            let User = yield UsersController.getModel(req, res, req['mySession']['clientDb']);
            let params = req.query;
            // console.log(params);
            let query = {
                $or: [
                    { username: { '$regex': params.filter, '$options': 'i' } },
                    { fullname: { '$regex': params.filter, '$options': 'i' } },
                ]
            };
            let options = {
                select: '_id username fullname status1 status2',
                sort: JSON.parse(params.sort),
                lean: false,
                offset: parseInt(params.first),
                limit: parseInt(params.rows)
            };
            let users = yield User.paginate(query, options);
            // console.log(users.docs);
            const result = {
                data: users.docs,
                total: users.total,
            };
            return response.ok_pagination(res, result);
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
    /**
    * @function lazyDataForFormControl
    * Retrieve document in simplest form {username, fullname} for form control (autocomplete)
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
    lazyDataForFormControl: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            let User = yield UsersController.getModel(req, res, req['mySession']['clientDb']);
            let params = req.query;
            // console.log(params);
            let query = {
                $and: [
                    {
                        $or: [
                            { username: { '$regex': params.filter, '$options': 'i' } },
                            { fullname: { '$regex': params.filter, '$options': 'i' } },
                        ]
                    },
                    { status1: 'Active' },
                    { status2: 'Unmarked' }
                ]
            };
            let options = {
                select: 'username fullname',
                sort: { fullname: 1, username: 1 },
                lean: false,
                offset: parseInt(params.first),
                limit: parseInt(params.rows)
            };
            let users = yield User.paginate(query, options);
            // console.log(users.docs);
            const result = {
                data: users.docs,
                total: users.total,
            };
            return response.ok_pagination(res, result);
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
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
    listDataForFormControl: (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            let User = yield UsersController.getModel(req, res, req['mySession']['clientDb']);
            let params = req.query;
            // console.log(params);
            let query = {
                $and: [
                    { status1: 'Active' },
                    { status2: 'Unmarked' }
                ],
                _id: false
            };
            let users = yield User.find(query).select('username fullname').sort({ fullname: 1, username: 1 });
            const result = {
                data: users,
                total: users.total,
            };
            return response.ok(res, result);
        }
        catch (err) {
            return response.fail_serverError(res, err);
        }
    }),
};
module.exports = UsersController;
