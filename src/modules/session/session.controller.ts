// External
import express = require("express");
var mongoose = require("mongoose");
// mongoose.Promise = global.Promise; // Deprecatd: Mongoose built in promise
mongoose.Promise = require("bluebird");

// Internal
var ConstantsBase = require('../../config/base/constants.base');
var SessionSchema = require('./session.schema');
var response = require('../../services/response.service');

var simpleHash = require('../../services/simpleHash.service');

// import  { SimpleHash } from '../../services/simpleHash.service';

/* SESSION MANAGEMENT APPROACH
 * Session is created at the first time of authentication
 * Session is update after the first time of authentication
 * Session is retrievable through:
 * - db:                  gkSession
 * - collection:          client Id
      + first authentication:   client Id is stored in req.body.token
      + after authentication:   client Id is stored in req.headers.token
 * - document:            user Id
 * - schema of session:
 *    + is defined at session.schema.ts
 *    + is created/ update at users.controller.ts
 */

var SessionController = {

  /* Return: Async new or updated session document */
  set: async(req: express.Request, res: express.Response)=> {
    try {
      console.log('[Session-01] Initialization');

      const sessionDbUri = ConstantsBase.urlSessionDb;
      const modelName = req.body.token;

      let sessionDb = await mongoose.createConnection(sessionDbUri, { useMongoClient: true, promiseLibrary: require("bluebird") });
      let Session = sessionDb.model(modelName, SessionSchema);

      const sessionContent = req['mySession'];

      console.log('[Session-02] Check if session exists');
      let existedSession = await Session.findById(req['mySession']['_id']);
      // console.log(existedSession);

      let mySession;
      if (existedSession) {
        console.log('[Session-03] Session should be updated');
        // Any changes here must update schema as well
        existedSession.username = req['mySession']['username'];
        existedSession.clientId = req['mySession']['clientId'];
        existedSession.wklge = req['mySession']['wklge'];
        existedSession.wkyear = req['mySession']['wkyear'];
        existedSession.tcodes = req['mySession']['tcodes'];
        mySession =  await existedSession.save();
      } else {
        console.log('[Session-03] Session should be newly created');
        const newSession = new Session(req['mySession']);
        mySession = await newSession.save();
      }

      if (!mySession) {
        throw new Error('Session could not be created or updated!');
      } else {
        console.log('[Session-04] Session process is completed!');
        return mySession;
      }

    }
    catch (error) {
      const result = {
        code: error.code || 500,
        message: 'Session Initialization Error!',
        data: error.message
      }
      return response.serverError(res, result);
    }
  },

  /* Return: Async a retrieved session document */
  get: async(req: express.Request, res: express.Response) => {
    try {
      console.log('[Session-01] Retrieval');

      var sessionDbUri = ConstantsBase.urlSessionDb;
      const modelName = req.headers.token;

      var sessionDb = await mongoose.createConnection(sessionDbUri, { useMongoClient: true, promiseLibrary: require("bluebird") });
      var Session = sessionDb.model(modelName, SessionSchema);

      console.log('[Session-02] Check and return session');
      let mySession = await Session.findById(req.headers.usr);

      if (!mySession) {
        throw new Error('Session could not be retrieved!');
      } else {
        console.log('[Session-03] Session is retrieved successfully!');
        return mySession;
      }
    }
    catch (error) {
      const result = {
        code: error.code || 500,
        message: 'Session Retrieval Error',
        data: error.message
      }
      return response.serverError(res, result);
    }
  },

  /* Return: Async directly return response via success or error [served as controler] */
  update: async(req: express.Request, res: express.Response) => {
    try {
      console.log('[Session-01] Retrieval for update');
      const sessionDbUri = ConstantsBase.urlSessionDb;
      const modelName = req.headers.token;
      let sessionDb = await mongoose.createConnection(sessionDbUri, { useMongoClient: true, promiseLibrary: require("bluebird") });
      let Session = sessionDb.model(modelName, SessionSchema);

      console.log('[Session-02] Check existed session');
      let existedSession = await Session.findById(req.headers.usr);

      let mySession;
      if (!existedSession) {
        throw new Error('Session could not be retrieved for update!');
      } else {
        console.log('[Session-03] Session is being updated');
        const awt = simpleHash.decode_array(JSON.parse(req.headers.awt));
        // const awt = SimpleHash.decode_array(JSON.parse(req.headers.awt));

        // Any changes here must update schema as well
        existedSession.wklge = awt[0];
        existedSession.wkyear = awt[1];
        mySession = await existedSession.save();
      }

      if (!mySession) {
        throw new Error('Session could not be updated!');
      } else {
        console.log('[Session-04] Session is updated successfully!');

        const result = {
          message: 'OK',
          data: {},
        }
        response.ok(res, result);
      }

    }
    catch (error) {
      const result = {
        code: error.code || 500,
        message: 'Session Retrieval Error',
        data: error.message
      }
      return response.serverError(res, result);
    }

  },

}

module.exports = SessionController;
