// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global. Promise;

// Internal
var ConstantsBase = require('../../config/base/constants.base');
import  { SimpleHash } from '../../services/simpleHash.service';
var SessionSchema = require('./session.schema');

var SessionController = {

  set: (req: express.Request, res: express.Response): any => {
    console.log('[Session-01] Initialization');

    var sessionDbUri = ConstantsBase.urlSessionDb;
    // console.log(sessionDbUri);
    var sessionDb = mongoose.createConnection(sessionDbUri, { useMongoClient: true });

    const modelName = req['clientDb'];
    // console.log(modelName);
    var Session = sessionDb.model(modelName, SessionSchema);

    const sessionContent = req['mySession'];
    // console.log(sessionContent);

    return Promise.resolve()
      .then(()=>{
        console.log('[Session-02] Check if session exists');
        return Session.findById(req['mySession']['_id']);
      })

      .then((mySession)=>{
        if (mySession) {
          console.log('[Session-03] Session Update');
          mySession.tcodes = req['mySession']['tcodes'];
          mySession.wklge = req['mySession']['wklge'];
          mySession.wkyear = req['mySession']['wkyear'];
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
    console.log('[Session-01] Retrieval');

    var sessionDbUri = ConstantsBase.urlSessionDb;
    // console.log(sessionDbUri);
    var sessionDb = mongoose.createConnection(sessionDbUri, { useMongoClient: true });

    var simpleHash = new SimpleHash();
    const awt = simpleHash.decode_array(JSON.parse(req.headers.awt));
    const modelName = awt[0];
    // console.log(modelName);
    var Session = sessionDb.model(modelName, SessionSchema);

    return Promise.resolve()
      .then(()=>{
        console.log('[Session-02] Check if session exists');
        return Session.findById(req.headers.usr);
      })

      .then((mySession)=>{
        console.log('[Session-02] Return session regardless its status');
        return Promise.resolve(mySession);
      })

      .catch((err)=> {
        console.log('[Session-xx] Session Initialization Error');
        return Promise.reject(err.message);
      });


  }
}

module.exports = SessionController;
