import express = require("express");
Promise = require("bluebird");
var fs = require("fs");
var json2csv = require('json2csv');
var fastCSV = require('fast-csv');
var deep = require('deep-diff').diff;
var nodemailer = require('nodemailer');
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

var helperService = require('../../services/helper.service');
// import  { HelperService } from '../../services/helper.service';

var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = require("bluebird");

var DBConnect = require('../../services/dbConnect.service');
var ConstantsBase = require('../../config/base/constants.base');

// var randomPassword = require('../../services/generatePassword.service');
var passwordService = require('../../services/password.service');

var simpleHash = require('../../services/simpleHash.service');

import { log } from "util";
var response = require('../../services/response.service');

var mailService = require('../../services/mail.service');
var UserSchema = require('./user.schema');
var UserHistorySchema = require('./user.history.schema');

var GkClientsController = require('../gkClients/gkClients.controller');
var GkClientSchema = require('../gkClients/gkClient.schema');

/*****************************************************************************************
 * USER CONTROLLER
 * @function getModel
 * @function getHistoryModel
 * @function authenticate
 * @function register
 * @function forgot
 * @function create
 * @function findAll
 * @function findById
 * @function update
 * @function delete
 *****************************************************************************************/
var UsersController = {

  getModel: async (req: express.Request, res: express.Response, clientDb) => {
    return DBConnect.connectMasterDB(req, res, 'User', UserSchema, clientDb);
    // try {
    //   const masterDbUri = ConstantsBase.urlMongo;
    //   const masterDb = await mongoose.createConnection(
    //     masterDbUri + clientDb +"_0000",
    //     {
    //       useMongoClient: true,
    //       promiseLibrary: require("bluebird")
    //     }
    //   );
    //   return masterDb.model('User', UserSchema);
    // }
    // catch (err) {
    //   err['data'] = 'Error in connecting server and create collection model!';
    //   return response.fail_serverError(res, err);
    // }
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
      return systemDb.model('UserHistory', UserHistorySchema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.fail_serverError(res, err);
    }
  },

  /*****************************************************************************************
   * AUTHENTICATE
   * Steps:
   * [01] Validate token
   * [02] Connect systemDb
   * [03] Get gkClient
   * [04] Connect masterDb of gkClient
   * [05] Get user of gkClient by username
   * [06] Authorize user of gkClient by password
   *****************************************************************************************/

  authenticate: async (req: express.Request, res: express.Response) => {
    try {
      console.log('Token: ', req.body.token);
      if (!mongoose.Types.ObjectId.isValid(req.body.token)) {
        const result = {
          message: `${req.body.token} is invalid token!`,
        }
        return response.fail_badRequest(res, result);
      }
      else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.body.token);

        helperService.log(client);

        if (!client) {
          return response.fail_notFound(res);
        } else {
          let User = await UsersController.getModel(req, res, client['clientDb']);
          let users = await User.find({ username: req.body.username});

          helperService.log(users);

          if (users.length == 0) {
            return response.fail_notFound(res);
          }
          else {
            let clientUser = users[0];

            if (!bcrypt.compareSync(req.body.password, clientUser.hash)) {
              return response.fail_unauthorized(res);
            }
            else {
              console.log('Hash validation: Matched');

              // Generate JWT / AWT / Client and Sever session data
              const token = jwt.sign({ sub: clientUser._id }, ConstantsBase.secret);
              const defaultLge = clientUser.defaultLge || '';
              const awt = simpleHash.encode_array([
                defaultLge,
                new Date().getFullYear().toString(),
              ]);
              const encodedTcodes = simpleHash.encode_array(clientUser.tcodes.sort());

              // data to pass back to frontend client
              const data = {
                _id:        clientUser._id,
                username:   clientUser.username,
                firstName:  clientUser.firstname,
                lastName:   clientUser.lastname,
                title:      clientUser.title,
                avatar:     clientUser.avatar,
                token:      token,
                awt:        awt,
                wklge:      clientUser.defaultLge,
                wkyear:     new Date().getFullYear().toString(),
                lges:       clientUser.lges,
                status:     clientUser.status,
                setting:    client.setting,
                tcodes:     encodedTcodes
              }

              helperService.log(data);

              // session to be stored for later use at backend server
              req['mySession'] = {
                _id:      clientUser._id,
                username: clientUser.username,
                clientId: req.body.token,
                clientDb: client.clientDb,
                wklge:    clientUser.defaultLge,
                wkyear:   new Date().getFullYear().toString(),
                setting:  client.setting,
                tcodes:   clientUser.tcodes.sort(),
              }

              // session to be stored for later use at backend server
              let sessionController = require('../session/session.controller');
              await sessionController.set(req, res);

              return res.send(data);

            } // End valid passwork

          } // End existed users

        } // End existed client

      } // End validated token
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }
  },

  /*****************************************************************************************
   * REGISTER
   * Steps:
   * [01] Validate token
   * [02] Connect systemDb
   * [03] Get gkClient
   * [04] Connect masterDb of gkClient
   * [05] Register new user of gkClient
   *****************************************************************************************/

  register: async (req: express.Request, res: express.Response) => {
    try {
      console.log('Token: ', req.body.token);
      if (!mongoose.Types.ObjectId.isValid(req.body.token)) {
        const result = {
          message: `${req.body.token} is invalid token!`,
        }
        return response.fail_badRequest(res, result);
      }
      else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.body.token);

        console.log('Client', client);
        if (!client) {
          return response.fail_notFound(res);
        } else {
          let User = await UsersController.getModel(req, res, client['clientDb']);

          let users = await User.find({
            $or: [
              { username: req.body.username },
              { email: req.body.email },
            ]
          });

          console.log('Users: ', users);
          if (users.length) {
            return response.fail_preCondition(res,{message: 'User already exist!'});
          }
          else {
            // Do not use standard way as hash is initialized and required
            // clientUser = new User(req.body);

            const tempUser = {
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              username: req.body.username,
              avatar : "default.png",
              hash: bcrypt.hashSync(req.body.password, 10),
              email: req.body.email,
            }
            let clientUser = new User(tempUser);
            let result = await clientUser.save();

            return response.ok(res, {message: 'Completed!'});

          } // End no duplication of username

        } // End existed client

      } // End validated token
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }

  },

  /*
   * FORGOT PASSWORD
   *
   * [01] Validate token
   * [02] Connect systemDb
   * [03] Get gkClient
   * [04] Connect masterDb of gkClient
   * [05] Get user of gkClient by username
   * [06] Save random password to user
   * [07] Reset password of user by sending new password to user email
   */

  forgot: async (req: express.Request, res: express.Response) => {
    try {
      console.log('Token: ', req.body.token);
      if (!mongoose.Types.ObjectId.isValid(req.body.token)) {
        const result = {
          message: `${req.body.token} is invalid token!`,
        }
        return response.fail_badRequest(res, result);
      }
      else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.body.token);

        console.log('Client', client);
        if (!client) {
          return response.fail_notFound(res);
        } else {
          let User = await UsersController.getModel(req, res, client['clientDb']);
          let users = await User.find({ email: req.body.email});

          console.log('Users: ', users);
          if (users.length == 0) {
            return response.fail_notFound(res);
          }
          else {
            let tempUser = users[0];
            console.log('Users[0]: ', tempUser);
            // let password = new randomPassword;
            // let tempPassword = password.generate();
            let tempPassword = passwordService.generate();
            console.log(tempPassword);

            tempUser.hash = bcrypt.hashSync(tempPassword, 10);
            // console.log('Temp User: ', tempUser);

            let savedUser = await new User(tempUser).save();
            console.log('Saved User: ', savedUser);

            const mailContent = {
              subject: 'Forgot password request!',
              from: 'GK|BPS',
              textMessage: `Your new password is: ${tempPassword}`, // plain text body
              htmlMessage: `<b>Your new password is: <i>${tempPassword}<i></b>`,  // html body
              to: savedUser.email
            }

            helperService.log(mailContent);

            let result = await mailService.send(res, mailContent);

            if (result.status == 200) {
              return response.ok(res, {});
            } else {
              return response.fail_serverError(res, result);
            }
          } // End no duplication of username

        } // End existed client

      } // End validated token
    }
    catch (err) {
      return response.fail_serverError(res, err);
    }

  },

  create: (req: express.Request, res: express.Response): void => {
    try {
      console.log(req);
      res.send({"success": "create"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

  findAll: (req: express.Request, res: express.Response): void => {
    try {
      console.log(req);
      res.send({"success": "findAll"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

  findAPIListPagination: async (req: express.Request, res: express.Response) => {
    try {
      console.log('here');

      let GkUser = await UsersController.getModel(req, res, 'gksbs');
      let params = req.query;
      console.log(params);

      let query = {
        $or: [
          {firstname: {'$regex': params.filter, '$options' : 'i'}},
          {lastname: {'$regex': params.filter, '$options' : 'i'}},
          {username: {'$regex': params.filter, '$options' : 'i'}}
        ]
      };

      let options = {
        select: 'firstname lastname username title',
        sort: JSON.parse(params.sort),
        lean: false,
        // leanWithId: false,
        offset: parseInt(params.first),
        limit: parseInt(params.rows)
      };

      let users = await GkUser.paginate(query, options);
      let docs = users.docs.map((element) => {
        return {
          username: element.username,
          fullname: element.lastname + ' ' + element.firstname
        }
      });
      console.log(docs);
      const result = {
        data: docs,
        total: users.total,
      }
      return response.ok_pagination(res, result);
    }
    catch (err) {
      response.fail_serverError(res, err);
    }
  },

  findById: (req: express.Request, res: express.Response): void => {
    try {
      res.send({"success": "findById"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

  update: (req: express.Request, res: express.Response): void => {
    try {
      res.send({"success": "update"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

  delete: (req: express.Request, res: express.Response): void => {
    try {
      res.send({"success": "delete"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

};
module.exports = UsersController;
