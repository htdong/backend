// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global. Promise;
var fs = require("fs");
var json2csv = require('json2csv');
var fastCSV = require('fast-csv');

// Internal
var ConstantsBase = require('../../config/base/constants.base');
var GkClientSchema = require('./gkClient.schema');
var response = require('../../services/response.service');
var FilesService = require('../../services/files.service');

var GkClientsController = {
  getModel: async (req: express.Request, res: express.Response) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(systemDbUri, { useMongoClient: true });      
      return systemDb.model('GkClient', GkClientSchema);
    } 
    catch (err) {
      const result = {
        code: err.code || 500,
        message: err.message,
        data: 'Error in connecting server and create collection model!'
      }
      return response.serverError(res, result);
    } 
  },
  create: async (req: express.Request, res: express.Response) => {
    try {
      req.body.status1 = 'Inactive';
      req.body.status2 = 'Unmarked';

      let GkClient = await GkClientsController.getModel(req, res);
      let gkClient = new GkClient(req.body);
      let client = await gkClient.save(); 
      
      const result = {
        message: 'Creation completed!',
        data: client._id
      }
      return response.created(res, result);
    }
    catch (err) {
      return response.createOrSaveFailed(res, err);
    }
  },

  findMasterListPagination: async (req: express.Request, res: express.Response) => {
    try {
      let GkClient = await GkClientsController.getModel(req, res);
      let params = req.query;
      let query = {
        $or: [
          {name: {'$regex': params.filter, '$options' : 'i'}},
          {clientDb: {'$regex': params.filter, '$options' : 'i'}}
        ]
      };
      let options = {
        select: '_id name clientDb status1 status2',
        sort: JSON.parse(params.sort),
        lean: false,
        offset: parseInt(params.first),
        limit: parseInt(params.rows)
      };
      
      let clients = await GkClient.paginate(query, options);      
      const result = {
        message: 'Success',
        data: clients.docs,
        total: clients.total,
      }      
      return response.ok(res, result);
    } 
    catch (err) {
      const result = {
        code: err.code || 500,
        message: err.message,
        data: err.data
      }
      return response.serverError(res, result);
    }
  },

  findById: async (req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
          data: {}
        }
        return response.badRequest(res, result);          
      } else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.params._id);
        console.log(client);
        if (!client) {
          const result = {
            message: 'Not found!',
            data: {},
          }
          return response.notFound(res, result);
        } else {
          const result = {
            message: 'OK',
            data: client,
          }
          return response.ok(res, result);
        }
      }
    }
    catch (err) {
      const result = {
        code: err.code || 500,
        message: err.message,
        data: err.data
      }
      return response.serverError(res, result);  
    }  
  },

  update: async (req: express.Request, res: express.Response) => {    
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
          data: {}
        }
        return response.badRequest(res, result);          
      } else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.params._id);
        console.log(client);
        if (!client) {
          const result = {
            message: 'Not found!',
            data: {},
          }
          return response.notFound(res, result);
        } else {
          client.name = req.body.name;
          client.clientDb = req.body.clientDb;
          client.addresses = req.body.addresses;
          client.contacts = req.body.contacts;
  
          let updatedClient = await client.save();
          if (updatedClient) {
            const result = {
              message: 'OK',
              data: updatedClient,
            }
            return response.ok(res, result);          
          } else {
            throw new Error('Patch failed!');            
          }
        }
      }
    }
    catch (err) {
      return response.createOrSaveFailed(res, err);
    }  
  },

  patch: async(req, res, patchType) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
          data: {}
        }
        return response.badRequest(res, result);          
      } else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.params._id);
        console.log(client);
        if (!client) {
          const result = {
            message: 'Not found!',
            data: {},
          }
          return response.notFound(res, result);
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

          let updatedClient = await client.save();
          if (updatedClient) {
            const result = {
              message: 'OK',
              data: updatedClient,
            }
            return response.ok(res, result);          
          } else {
            throw new Error('Patch failed!');            
          }
          
        }
      }
    }
    catch (err) {
      const result = {
        code: err.code || 500,
        message: err.message,
        data: err.data
      }
      return response.serverError(res, result);  
    }    
  },

  disable: (req: express.Request, res: express.Response) => {    
    GkClientsController.patch(req, res, 'disable');    
  },

  enable: (req: express.Request, res: express.Response) => {    
    GkClientsController.patch(req, res, 'enable');
  },

  mark: (req: express.Request, res: express.Response) => {    
    GkClientsController.patch(req, res, 'mark');  
  },

  unmark: (req: express.Request, res: express.Response) => {    
    GkClientsController.patch(req, res, 'unmark');  
  },

  delete: async(req: express.Request, res: express.Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        const result = {
          message: `${req.params._id} is invalid Id!`,
          data: {}
        }
        return response.badRequest(res, result);          
      } else {
        let GkClient = await GkClientsController.getModel(req, res);
        let client = await GkClient.findById(req.params._id);
        if (!client) {
          const result = {
            message: 'Not found!',
            data: {},
          }
          return response.notFound(res, result);
        } else {                    
          let removedClient = await client.remove();
          if (removedClient) {
            const result = {
              message: 'OK',
              data: removedClient,
            }            
            return response.ok(res, result);          
          } else {
            throw new Error('Remove failed!');            
          }          
        }
      }
    }
    catch (err) {
      const result = {
        code: err.code || 500,
        message: err.message,
        data: err.data
      }
      return response.serverError(this.res, result);
    }
  },

  upload: async(req: express.Request, res: express.Response) => {
    try {
      console.log('...[1]Uploading file');
      let fileService = new FilesService();
      let uploadStatus = await fileService.upload(req, res);
      console.log(uploadStatus);

      console.log('...[2]Processing uploaded file');  
      let GkClient = await GkClientsController.getModel(req, res);

      let uploadFile = uploadStatus.data.path;
      let uploadData = [];            
      let errArray = [];
      
      // const size = 2; // For chunking purpose
      // let batchArray = [];
            
      var stream = fs.createReadStream(uploadFile);      
      fastCSV
       .fromStream(stream, { headers : true })
       .on("data", (data) => {
        data['_id'] = new mongoose.Types.ObjectId();
        uploadData.push(data);
       })
       .on("end", () => {        
        
        /* 
        // Split array into chunks
        console.log(uploadData.length);        
        for (let i=0; i< uploadData.length; i+=size) {
          batchArray.push(uploadData.slice(i, i+size));
        }
        console.log(batchArray);
        */
        
        Promise
          .all(uploadData.map(item => {
            return GkClient.create(item).catch(error => ({error}))
          }))
          .then(items => {

            let errorArray = [];
            let count = 0;
            items.forEach(item => {
              count = count + 1;
              if (item.error) {
                errorArray.push({
                  line: count,
                  error: `Error ${item.error.errmsg}`
                });    
              } 
            }); 
            
            let message = `${errorArray.length} / ${uploadData.length} items encountered errors!`;            
                      
            let result = ({
              message: message,
              data: {
                "created": (uploadData.length - errorArray.length),
                "errors": errorArray.length,
                "errorDetails": errorArray
              },
              // url: req.path              
            });

            return response.upsertHandler(res, result);            
          });          
       });
            
    }
    catch(error) {
      const result = {
        code: error.code || 500,
        message: error.message,
        data: error.data
      }
      return response.serverError(res, result);  
    }      

  },

  download: async(req: express.Request, res: express.Response)=> {    
    try {
      console.log('Download file');
      // console.log(req.query);

      let fields = [
        '_id',
        'name',
        'addresses',
        'contacts',
        'clientDb',
        'status1',
        'status2',
        'remarks'
      ];
      
      let GkClient = await GkClientsController.getModel(req, res);
      let clients = await GkClient.find({});
      let csv = json2csv({data: clients, fields: fields});      
      // console.log(csv);
      
      // DIRECT DOWNLOAD VIA BLOB OR STREAM AT CLIENTSIDE
      //res.set("Content-Disposition", "attachment; filename=gkClient.csv");
      //res.set("Content-Type", "application/octet-stream");
      //return res.send(csv);

      // INDIRECT DOWNLOAD BY CREATING FILE AT SERVERSIDE FOR STATIC FILE SERVE    
      /*
      const userfilename = req.query.filename || 'default';
      const filename = userfilename + '.csv';
      const path = '../repo/download/' + filename;
      fs.writeFile(path, csv, function(err) {
        if (err) throw err;
        console.log('Send file address to client for downloading');
        res.json({filename: filename});
      });      
      */
      let fs = new FilesService();
      return fs.downloadCSV(req, res, csv);      
    }
    catch (error) {
      const result = {
        code: error.code || 500,
        message: error.message,
        data: "Download failed"
      }
      return response.serverError(res, result);    
    }
  },

  upsert: async(req: express.Request, res: express.Response) => {
    try {
      console.log('...[1]Uploading file');
      let fileService = new FilesService();
      let uploadStatus = await fileService.upload(req, res);
      console.log(uploadStatus);

      console.log('...[2]Processing uploaded file');  
      let GkClient = await GkClientsController.getModel(req, res);

      let uploadFile = uploadStatus.data.path;
      let uploadData = [];            
      let errArray = [];
      
      // const size = 2; // For chunking purpose
      // let batchArray = [];
            
      var stream = fs.createReadStream(uploadFile);      
      fastCSV
       .fromStream(stream, { headers : true })
       .on("data", (data) => {
        if (!mongoose.Types.ObjectId.isValid(data['_id'])) {
          data['_id'] = new mongoose.Types.ObjectId();
        }         
        uploadData.push(data);
       })
       .on("end", () => {        

        Promise
          .all(uploadData.map(item => {
            console.log(item);
            return GkClient.update( 
              {_id: item._id }, 
              item, 
              { upsert: true, new: true }
            ).catch(error => ({error}));                        
          }))
          .then(items => {

            let errorArray = [];
            let count = 0;
            items.forEach(item => {
              count = count + 1;
              if (item.error) {
                errorArray.push({
                  line: count,
                  error: `Error ${item.error.errmsg}`
                });    
              } 
            }); 
            
            let message = `${errorArray.length} / ${uploadData.length} items encountered errors!`;            
                      
            let result = ({
              message: message,
              data: {
                "created": (uploadData.length - errorArray.length),
                "errors": errorArray.length,
                "errorDetails": errorArray
              },
              // url: req.path              
            });

            return response.upsertHandler(res, result);            
          });          
       });
            
    }
    catch(error) {
      const result = {
        code: error.code || 500,
        message: error.message,
        data: error.data
      }
      return response.serverError(res, result);  
    }      

  },  

};

module.exports = GkClientsController;
