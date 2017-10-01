// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global. Promise;

// Internal
var ConstantsBase = require('../../config/base/constants.base');
var GkClientSchema = require('./gkClient.schema');

var GkClientsController = {

  create: (req: express.Request, res: express.Response): void => {
    var systemDbUri = ConstantsBase.urlSystemDb;
    var gkClient;
    var code = '';
    var message = '';

    mongoose.createConnection(systemDbUri, { useMongoClient: true })
    .then((systemDb) => {
      console.log('[01] Connect systemDb');
      req.body.status1 = 'Inactive';
      req.body.status2 = 'Unmarked';
      console.log(req.body);
      var GkClient = systemDb.model('GkClient', GkClientSchema);
      // Set status1 and status2

      var gkClient = new GkClient(req.body);

      return gkClient.save();
    })
    .then((client) => {
      console.log('[02] Save GkClient');
      console.log(client);
      const result = {
        message: 'Creation completed!',
        data: client._id,
      }
      res.status(201).send(result);
    })
    .catch((err) => {
      console.log(err);

      if (err.message.indexOf('validation failed') !== -1) {
        const result = {
          message: 'Validation failed',
          data: err.message,
        }
        res.status(412).send(result);
      } else if (err.message.indexOf('duplicate key error') !== -1) {
        const result ={
          message: 'Key duplication error',
          data: err.message,
        }
        res.status(412).send(result);
      } else {
        message = 'Error';  //err.message
        const result = {
          message: 'Bad request',
          data: err.message,
        }
        res.status(400).send(result);
      }

    });
  },

  findAll: (req: express.Request, res: express.Response): void => {
    var systemDbUri = ConstantsBase.urlSystemDb;
    var gkClient;

    mongoose.createConnection(systemDbUri, { useMongoClient: true })
    .then((systemDb) => {
      console.log('[01] Connect systemDb');
      var GkClient = systemDb.model('GkClient', GkClientSchema);
      return GkClient.find({});
    })
    .then((clients) => {
      console.log('[02] Get GkClients');
      console.log(clients);
      const gkData = {
        code: 200,
        message: '',
        data: clients
      }
      res.send(gkData);
    })
    .catch((err) => {
      const gkData = {
        code: 400,
        message: err.message
      }
      console.log(err);
      res.send(gkData);
    });
  },

  findMasterList: (req: express.Request, res: express.Response): void => {
    var systemDbUri = ConstantsBase.urlSystemDb;
    var gkClient;

    mongoose.createConnection(systemDbUri, { useMongoClient: true })
    .then((systemDb) => {
      console.log('[01] Connect systemDb');
      var GkClient = systemDb.model('GkClient', GkClientSchema);
      return GkClient.find({}).select('_id name clientDb status1 status2');
    })
    .then((clients) => {
      console.log('[02] Get GkClients');
      console.log(clients);
      const gkData = {
        code: 200,
        message: '',
        data: clients
      }
      res.send(gkData);
      /*
      setTimeout(() => {
            res.send(gkData);
        }, 4000);
      */

    })
    .catch((err) => {
      const gkData = {
        code: 400,
        message: err.message
      }
      console.log(err);
      res.status(400).send(gkData);
    });
  },

  findById: (req: express.Request, res: express.Response): void => {
    var systemDbUri = ConstantsBase.urlSystemDb;
    var gkClient;
    console.log(req.params._id);

    Promise.resolve()
      .then(()=> {
        if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
          let error = new Error(`${req.params._id} is invalid Id!`);
          throw error;
        }
        return Promise.resolve();
      })
      .then(()=> {
        console.log('[01] Validate _id');
        return mongoose.createConnection(systemDbUri, { useMongoClient: true })
      })
      .then((systemDb) => {
        console.log('[02] Connect systemDb');
        var GkClient = systemDb.model('GkClient', GkClientSchema);
        return GkClient.findById(req.params._id);
      })
      .then((client) => {
        console.log('[03] Get GkClients');
        console.log(client);

        if (!client) {
          const result = {
            message: 'Not found!',
            data: '',
          }
          res.status(404).send(result);
        } else {
          const result = {
            message: 'OK',
            data: client,
          }
          console.log(result);
          res.status(200).send(result);
        }

      })
      .catch((err) => {
        console.log(err);

        const result = {
          message: 'Bad request',
          data: err.message,
        }
        res.status(400).send(result);

      });
  },

  update: (req: express.Request, res: express.Response): void => {
    var systemDbUri = ConstantsBase.urlSystemDb;
    var gkClient;
    console.log(req.params._id);

    Promise.resolve()
      .then(()=> {
        if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
          let error = new Error(`${req.params._id} is invalid Id!`);
          throw error;
        }
        return Promise.resolve();
      })
      .then(()=> {
        console.log('[01] Validate _id');
        return mongoose.createConnection(systemDbUri, { useMongoClient: true })
      })
      .then((systemDb) => {
        console.log('[02] Connect systemDb');
        var GkClient = systemDb.model('GkClient', GkClientSchema);
        return GkClient.findById(req.params._id);
      })
      .then((client) => {
        console.log('[03] Get GkClients');
        console.log(client);

        if (!client) {
          const result = {
            message: 'Not found!',
            data: '',
          }
          res.status(404).send(result);
        } else {

          client.name = req.body.name;
          client.clientDb = req.body.clientDb;
          client.addresses = req.body.addresses;
          client.contacts = req.body.contacts;

          return client.save();
        }
      })
      .then((client) => {
        console.log('[05] Save GkClient');
        console.log(client);
        const result = {
          message: 'Update completed!',
          data: client,
        }
        res.status(200).send(result);
      })
      .catch((err) => {
        console.log(err);

        const result = {
          message: 'Bad request',
          data: err.message,
        }
        res.status(400).send(result);

      });
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
