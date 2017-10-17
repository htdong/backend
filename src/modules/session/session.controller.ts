// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// Internal
var ConstantsBase = require('../../config/base/constants.base');
var SessionSchema = require('./session.schema');

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

}

module.exports = SessionController;
