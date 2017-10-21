// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global. Promise;

// Internal
var ConstantsBase = require('../../config/base/constants.base');
var GkClientSchema = require('./gkClient.schema');

var FilesService = require('../../services/files.service');
import { GkClientModel } from './gkClient.model';

var GkClientsController = {

  create: (req: express.Request, res: express.Response): void => {
    new GkClientModel(req, res).create();  
  },

  findAll: (req: express.Request, res: express.Response): void => {    
    new GkClientModel(req, res).findAll();    
  },

  /*
  findMasterList: (req: express.Request, res: express.Response): void => {
    var systemDbUri = ConstantsBase.urlSystemDb;
    var gkClient;
    mongoose.createConnection(systemDbUri, { useMongoClient: true })
    .then((systemDb) => {
      console.log('[01] Connect systemDb');
      var GkClient = systemDb.model('GkClient', GkClientSchema);

      var GkClient1 = systemDb.model('GkClient', GkClientSchema);
      var query = {$or: [{status1: 'Active'}, {status2: 'Marked'}]};
      var options = {
        select: '_id name db status1 status2',
        sort: {_id: 1},
        lean: false,
        page: 2,
        limit: 10
      };
      GkClient1.paginate(query, options)
        .then((results) => {
          console.log('[01] Get GkClients Pagination');
          console.log(results);
        })

      return GkClient.find({}).select('_id name clientDb status1 status2');
    })
    .then((clients) => {
      console.log('[02] Get GkClients');
      console.log(clients);
      const result = {
        message: 'Success',
        data: clients
      }
      res.status(200).send(result);
      //res.status(201).send(result);
      //res.status(304).send();
      //res.status(400).send();
      //res.status(401).send();
      //res.status(403).send();
      //res.status(404).send();
      //res.status(500).send();
    })
    .catch((err) => {
      console.log(err);

      if (err.code) {
        const result = {
          code: err.code,
          message: err.message,
          data: err.data
        }
        res.status(err.code).send(result);
      } else {
        const result = {
          code: 400,
          message: err.message,
          data: {}
        }
        res.status(400).send(result);
      }

    });
  },
  */

  findMasterListPagination: (req: express.Request, res: express.Response): void => {
    new GkClientModel(req, res).findAllPagination();    
  },

  findById: (req: express.Request, res: express.Response): void => {
    new GkClientModel(req, res).findById();
  },

  update: (req: express.Request, res: express.Response): void => {    
    new GkClientModel(req, res).update();    
  },

  disable: (req: express.Request, res: express.Response): void => {    
    new GkClientModel(req, res).patch('disable');    
  },

  enable: (req: express.Request, res: express.Response): void => {    
    new GkClientModel(req, res).patch('enable');    
  },

  mark: (req: express.Request, res: express.Response): void => {    
    new GkClientModel(req, res).patch('mark');    
  },

  unmark: (req: express.Request, res: express.Response): void => {    
    new GkClientModel(req, res).patch('unmark');    
  },

  delete: (req: express.Request, res: express.Response): void => {
    new GkClientModel(req, res).deleteById();  
  },

  upload: (req: express.Request, res: express.Response): void => {

    var filesService = new FilesService();

    filesService.upload(req, res)
      .then((result) => {
        console.log(result);

        // TODO: Process data upload into collection here

        res.status(200).send(result);
      })
      .catch((err) => {
        console.log(err);

        const result = {
          message: 'Bad request',
          data: err.message,
        }
        res.status(400).send(result);
      })

  },

  download: (req: express.Request, res: express.Response): void => {

  }

};

module.exports = GkClientsController;
