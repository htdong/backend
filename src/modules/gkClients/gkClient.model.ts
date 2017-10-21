// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// Internal
var response = require('../../services/response.service');

import { model as mdGkClient, GkClientType as GkClientType } from './gkClient.class';

var ConstantsBase = require('../../config/base/constants.base');
var GkClientSchema = require('./gkClient.schema');

var FilesService = require('../../services/files.service');

export class GkClientModel {
  modelName =  'GkClient';
  systemDbUri;

  req: express.Request; 
  res: express.Response;  

  constructor (req: express.Request, res: express.Response) {
    this.req = req;
    this.res = res;
    this.systemDbUri = ConstantsBase.urlSystemDb;
  }

  create() {
    return Promise.resolve()
      .then(() => {
        return mongoose.createConnection(this.systemDbUri, { useMongoClient: true });
      })
      .then((systemDb) => {
        // console.log(req.body);
        // Set status1 and status2
        this.req.body.status1 = 'Inactive';
        this.req.body.status2 = 'Unmarked';
        var GkClient = systemDb.model('GkClient', GkClientSchema);        
        var gkClient = new GkClient(this.req.body);

        return gkClient.save();
      })
      .then((client) => {
        // console.log(client);
        const result = {
          message: 'Creation completed!',
          data: client._id
        }
        return response.created(this.res, result);
      })
      .catch((err) => {
        return response.createOrSaveFailed(this.res, err);
      });
  }

  findAll() {
    return Promise.resolve()
      .then(() => {
        return mongoose.createConnection(this.systemDbUri, { useMongoClient: true });
      })
      .then((systemDb) => {
        var GkClient = systemDb.model('GkClient', GkClientSchema);
        return GkClient.find({});
      })
      .then((clients) => {
        // console.log(clients);
        const result = {
          message: '',
          data: clients,
          total: clients.length
        }
        return response.ok(this.res, result);
      })
      .catch((err) => {
        // console.log(err);
        const result = {
          code: err.code || 500,
          message: err.message,
          data: err.data
        }
        return response.serverError(this.res, result);  
      });
  }

  findById() {
    return Promise.resolve()
      .then(()=> {
        if (!mongoose.Types.ObjectId.isValid(this.req.params._id)) {
          const result = {
            message: `${this.req.params._id} is invalid Id!`,
            data: {}
          }
          return response.badRequest(this.res, result);          
        } else {
          return Promise.resolve();
        }        
      })
      .then(()=> {
        return mongoose.createConnection(this.systemDbUri, { useMongoClient: true })
      })
      .then((systemDb) => {
        var GkClient = systemDb.model('GkClient', GkClientSchema);
        return GkClient.findById(this.req.params._id)
      })
      .then((client)=>{
        // console.log(client);
        if (!client) {
          const result = {
            message: 'Not found!',
            data: {},
          }
          return response.notFound(this.res, result);
        } else {
          const result = {
            message: 'OK',
            data: client,
          }
          return response.ok(this.res, result);
        }
      })
      .catch((err) => {
        const result = {
          code: err.code || 500,
          message: err.message,
          data: err.data
        }
        return response.serverError(this.res, result);
      });
  }

  update() {
    return Promise.resolve()
    .then(()=> {
      if (!mongoose.Types.ObjectId.isValid(this.req.params._id)) {
        const result = {
          message: `${this.req.params._id} is invalid Id!`,
          data: {}
        }
        return response.badRequest(this.res, result);          
      } else {
        return Promise.resolve();
      }        
    })
    .then(()=> {
      return mongoose.createConnection(this.systemDbUri, { useMongoClient: true })
    })
    .then((systemDb) => {
      var GkClient = systemDb.model('GkClient', GkClientSchema);
      return GkClient.findById(this.req.params._id);
    })
    .then((client) => {
      //console.log(client);
      if (!client) {
        const result = {
          message: 'Not found!',
          data: {},
        }
        return response.notFound(this.res, result);
      } else {
        client.name = this.req.body.name;
        client.clientDb = this.req.body.clientDb;
        client.addresses = this.req.body.addresses;
        client.contacts = this.req.body.contacts;

        return client.save();
      }
    })
    .then((client) => {
      // console.log(client);
      const result = {
        message: 'Update completed!',
        data: client,
      }
      return response.ok(this.res, result);
    })
    .catch((err) => {
      return response.createOrSaveFailed(this.res, err);
    });

  }

  // TODO: patch
  patch(patchType) {
    return Promise.resolve()
    .then(()=> {
      if (!mongoose.Types.ObjectId.isValid(this.req.params._id)) {
        const result = {
          message: `${this.req.params._id} is invalid Id!`,
          data: {}
        }
        return response.badRequest(this.res, result);          
      } else {
        return Promise.resolve();
      }        
    })
    .then(()=> {
      return mongoose.createConnection(this.systemDbUri, { useMongoClient: true })
    })
    .then((systemDb) => {
      var GkClient = systemDb.model('GkClient', GkClientSchema);
      return GkClient.findById(this.req.params._id);
    })
    .then((client) => {
      //console.log(client);
      if (!client) {
        const result = {
          message: 'Not found!',
          data: {},
        }
        return response.notFound(this.res, result);
      } else {
        switch (patchType) {
          case 'disable':
            client.status1 = 'Inactive';
            break;
          case 'enable':
            client.status1 = 'Active';
            break;  
          case 'mark':
            client.status2 = 'Marked';
            break;  
          case 'unmark':
          client.status2 = 'Unmarked';
            break;  
          default:
            break;  
        }        
        return client.save();
      }
    })
    .then((client) => {
      // console.log(client);
      const result = {
        message: 'Update completed!',
        data: client,
      }
      return response.ok(this.res, result);
    })
    .catch((err) => {
      return response.createOrSaveFailed(this.res, err);
    });

  }

  // TODO: delete
  deleteById() {
    return Promise.resolve()
      .then(()=> {
        if (!mongoose.Types.ObjectId.isValid(this.req.params._id)) {
          const result = {
            message: `${this.req.params._id} is invalid Id!`,
            data: {}
          }
          return response.badRequest(this.res, result);          
        } else {
          return Promise.resolve();
        }        
      })
      .then(()=> {
        return mongoose.createConnection(this.systemDbUri, { useMongoClient: true })
      })
      .then((systemDb) => {
        var GkClient = systemDb.model('GkClient', GkClientSchema);
        return GkClient.findById(this.req.params._id)
      })
      .then((client)=>{
        // console.log(client);
        if (!client) {
          const result = {
            message: 'Not found!',
            data: {},
          }
          return response.notFound(this.res, result);
        } else {
          return client.remove();                    
        }
      })
      .then((removeResult)=> {
        console.log(removeResult);
        const result = {
          message: 'OK',
          data: removeResult,
        }
        return response.ok(this.res, result);
      })
      .catch((err) => {
        const result = {
          code: err.code || 500,
          message: err.message,
          data: err.data
        }
        return response.serverError(this.res, result);
      });
  }

  findAllPagination() {
    return Promise.resolve()
      .then(() => {
        return mongoose.createConnection(this.systemDbUri, { useMongoClient: true });
      })
      .then((systemDb) => {
        var GkClient = systemDb.model('GkClient', GkClientSchema);
        
        // var tgGkClient = new GkClientType().getModelForClass(GkClientType, {schemaOptions: {collection: 'GkClient'}, existingConnection: systemDb});        
        // console.log(tgGkClient.paginate);
        // console.log(GkClient == tgGkClient);
        
        var params = this.req.query;
        // console.log(params);
        var query = {
          $or: [
            {name: {'$regex': params.filter, '$options' : 'i'}},
            {clientDb: {'$regex': params.filter, '$options' : 'i'}}
          ]
        };
        var options = {
          select: '_id name clientDb status1 status2',
          sort: JSON.parse(params.sort),
          lean: false,
          offset: parseInt(params.first),
          limit: parseInt(params.rows)
        };
        // console.log(options);        
        // return tgGkClient.paginate(query, options);        
        return GkClient.paginate(query, options);
      })
      .then((results) => {
        // console.log(results);
        const result = {
          message: 'Success',
          data: results.docs,
          total: results.total,
        }
        // console.log(result);        
        return response.ok(this.res, result);
      })
      .catch((err) => {
        const result = {
          code: err.code || 500,
          message: err.message,
          data: err.data
        }
        return response.serverError(this.res, result);
      });
  }
}
