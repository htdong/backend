// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// Internal
var ConstantsBase = require('../../config/base/constants.base');
var SessionSchema = require('./session.schema');

import  { SimpleHash } from '../../services/simpleHash.service';
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

  set: (req: express.Request, res: express.Response): any => {
    console.log('[Session-01] Initialization');

    // Session Db
    var sessionDbUri = ConstantsBase.urlSessionDb;
    var sessionDb = mongoose.createConnection(sessionDbUri, { useMongoClient: true });

    // Session Model
    const modelName = req.body.token;
    var Session = sessionDb.model(modelName, SessionSchema);
    // console.log(modelName);

    const sessionContent = req['mySession'];
    // console.log(sessionContent);

    return Promise.resolve()
      .then(()=>{
        console.log('[Session-02] Check if session exists');
        // req['mySession']['_id'] store user id
        return Session.findById(req['mySession']['_id']);
      })

      .then((mySession)=>{
        if (mySession) {
          console.log('[Session-03] Session Update');

          // Any changes here must update schema as well
          mySession.clientId = req['mySession']['clientId'];
          mySession.wklge = req['mySession']['wklge'];
          mySession.wkyear = req['mySession']['wkyear'];
          mySession.tcodes = req['mySession']['tcodes'];
          return mySession.save();

        } else {
          console.log('[Session-03] Session Create New');
          const newSession = new Session(req['mySession']);
          return newSession.save();
        }
      })

      .catch((err)=> {
        console.log('[Session-xx] Session Initialization Error');
        return Promise.reject(err.message);
      });

  },

  get: (req: express.Request, res: express.Response) => {
    return Promise.resolve()
      .then(()=>{
        console.log('[Session-01] Retrieval');

        // Session Db
        var sessionDbUri = ConstantsBase.urlSessionDb;
        var sessionDb = mongoose.createConnection(sessionDbUri, { useMongoClient: true });

        // Session Model
        const modelName = req.headers.token;
        var Session = sessionDb.model(modelName, SessionSchema);
        console.log(modelName);

        console.log('[Session-02] Check and return session');
        return Session.findById(req.headers.usr);
      })
      .catch((err)=> {
        console.log('[Session-xx] Session Initialization Error');
        return Promise.reject(err.message);
      });
  },

  update: (req: express.Request, res: express.Response): any => {
    console.log('[Session-01] Retrieval for update');

    // Session Db
    var sessionDbUri = ConstantsBase.urlSessionDb;

    mongoose.createConnection(sessionDbUri, { useMongoClient: true })
      .then((sessionDb) => {
        // Session Model - get clientId via token
        const modelName = req.headers.token;
        var Session = sessionDb.model(modelName, SessionSchema);
        // console.log(modelName);

        console.log('[Session-02] Check and return session');
        return Session.findById(req.headers.usr);
      })

      .then((mySession)=>{
        if (mySession) {
          console.log('[Session-03] Session Update');

          var simpleHash = new SimpleHash();
          const awt = simpleHash.decode_array(JSON.parse(req.headers.awt));

          // Any changes here must update schema as well
          mySession.wklge = awt[0];
          mySession.wkyear = awt[1];
          // console.log(mySession);
          return mySession.save();

        } else {
          let error = new Error(`Session is not available!`);
          throw error;
        }
      })

      .then((savedSession)=>{
        const result = {
          message: 'OK',
          data: {},
        }
        // console.log(result);
        res.status(200).send(result);
      })

      .catch((err)=> {
        console.log('[Session-xx] Session Initialization Error');
        const result = {
          code: 500,
          message: err.message
        }
        console.log(err);
        res.status(500).send(result);
      });

  },

}

module.exports = SessionController;
