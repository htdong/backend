// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global. Promise;

// Internal
var ConstantsBase = require('../../config/base/constants.base');
var GkClientSchema = require('./gkClient.schema');

var GkClientsController = {

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

module.exports = GkClientsController;
