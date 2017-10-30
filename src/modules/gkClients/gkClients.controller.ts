// External
import express = require("express");
var mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
mongoose.Promise = global. Promise;
var fs = require("fs");
var json2csv = require('json2csv');
var fastCSV = require('fast-csv');
var deep = require('deep-diff').diff;

// Internal
var ConstantsBase = require('../../config/base/constants.base');
var GkClientSchema = require('./gkClient.schema');
var GkClientHistorySchema = require('./gkClient.history.schema');
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

  trackHistory: async (req, multi:boolean, tcode: string, oldData, newData) => {
    try {
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(systemDbUri, { useMongoClient: true });      
      let GkClientHistory = systemDb.model('GkClientHistory', GkClientHistorySchema);
      
      let history;
      if (!multi) {        
        const id = newData._id || oldData._id;
        
        delete oldData._id;
        delete newData._id;

        const diff = deep(oldData, newData);
        console.log(diff);
              
        history = {
          docId: id,
          username: req['mySession']._id,
          tcode: tcode,
          diff: diff
        }
      } else {
        history = {
          docId: '',
          username: req['mySession']._id,
          tcode: tcode,
          diff: newData
        }
      }
      console.log(history);
            
      let gkClientHistory = new GkClientHistory(history);
      
      return gkClientHistory.save();
    } 
    catch (err) {
      console.log(err);            
    }     
  },

  /*
   * INDIVIDUAL PROCESSING 
   */
  create: async (req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln11';

      req.body.status1 = 'Active';
      req.body.status2 = 'Unmarked';

      let GkClient = await GkClientsController.getModel(req, res);
      let gkClient = new GkClient(req.body);
      
      let client = await gkClient.save(); 
            
      let trackHistory = GkClientsController.trackHistory(req, false, tcode, {_id:''}, gkClient.toObject());

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
      const tcode = 'gkcln13';

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
          // console.log(req.body);
          
          const oldClient = JSON.stringify(client);

          client.name = req.body.name;
          client.clientDb = req.body.clientDb;
          client.addresses = req.body.addresses;
          client.contacts = req.body.contacts;
          
          let updatedClient = await client.save();
          if (updatedClient) {          

            let trackHistory = GkClientsController.trackHistory(req, false, tcode, JSON.parse(oldClient), updatedClient.toObject());            

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
      let tcode = '';
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

          const oldClient = JSON.stringify(client);

          switch (patchType) {
            case 'disable':
              tcode = 'gkcln14';
              client.status1 = 'Inactive';
              break;
            case 'enable':
              tcode = 'gkcln15';
              client.status1 = 'Active';
              break;  
            case 'mark':
              tcode = 'gkcln16';
              client.status2 = 'Marked';
              break;  
            case 'unmark':
              tcode = 'gkcln17';
              client.status2 = 'Unmarked';
              break;  
            default:
              break;  
          }        
          
          let updatedClient = await client.save();
          if (updatedClient) {

            let trackHistory = GkClientsController.trackHistory(req, false, tcode, JSON.parse(oldClient), updatedClient.toObject());            

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
      const tcode = 'gkcln18';

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
            // console.log(removedClient);
            
            let trackHistory = GkClientsController.trackHistory(req, false, tcode, removedClient.toObject(), {_id:''});            
            
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

  viewChangeById: async (req: express.Request, res: express.Response) => {

  },

  /*
   * COLLECTIVE PROCESSING 
   */
  upload: async(req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln21';

      console.log('...[1]Upload file to server');
      let fileService = new FilesService();
      let uploadStatus = await fileService.upload(req, res);
      // console.log(uploadStatus);

      console.log('...[2]Process items into Database by create new');  
      let GkClient = await GkClientsController.getModel(req, res);

      let uploadFile = uploadStatus.data.path;
      let uploadData = [];            
      let errArray = [];            
            
      var stream = fs.createReadStream(uploadFile);

      fastCSV
       .fromStream(stream, { headers : true })

       .on("data", (data) => {
        //UPLOAD will generate new _id 
        data['_id'] = new mongoose.Types.ObjectId();
        uploadData.push(data);
       })

       .on("end", () => {                
        /* 
        // SPLIT INTO CHUNKS
        const size = 2; // For chunking purpose
        let batchArray = [];
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
                  error: `Error: ${item.error.errmsg}`
                });    
              } 
            }); 
            
            let message = `${(uploadData.length - errorArray.length)} / ${uploadData.length} items are processed!`;
                      
            let result = ({
              message: message,
              data: {
                "n": uploadData.length,
                "nModified": (uploadData.length - errorArray.length),
                "nErrors": errorArray.length,
                "errorDetails": errorArray,
              },
            });

            if (uploadData.length - errorArray.length) {                                          
              const filename = uploadStatus.data.path.split('/');
              let trackHistory = GkClientsController.trackHistory(req, true, tcode, {}, filename[filename.length - 1]);  
            }
            
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
      console.log('...[1]Process Database JSON to CSV');
      // console.log(req.query);

      // Follow order of schema to easily update change
      let fields = [
        '_id',
        'name',
        'addresses',
        'contacts',
        'solutions',
        'clientDb',
        'remarks',
        'status1',
        'status2'
      ];
      
      let GkClient = await GkClientsController.getModel(req, res);
      let clients = await GkClient.find({});
      
      let csv = json2csv({data: clients, fields: fields});      
      // console.log(csv);
      
      // DIRECT DOWNLOAD VIA BLOB OR STREAM AT CLIENTSIDE
      /*       
      res.set("Content-Disposition", "attachment; filename=gkClient.csv");
      res.set("Content-Type", "application/octet-stream");
      return res.send(csv); 
      */

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
      
      console.log('...[2]Generate temporary file for download');
      let fileService = new FilesService();
      return fileService.downloadCSV(req, res, csv);      

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
      const tcode = 'gkcln23';
      
      console.log('...[1]Upload file to server');
      let fileService = new FilesService();
      let uploadStatus = await fileService.upload(req, res);
      // console.log(uploadStatus);
 
      console.log('...[2]Process items into Database by upsert');   
      let GkClient = await GkClientsController.getModel(req, res);

      let uploadFile = uploadStatus.data.path;
      let uploadData = [];            
      let errArray = [];
            
      var stream = fs.createReadStream(uploadFile);  

      fastCSV
       .fromStream(stream, { headers : true })

       .on("data", (data) => {
        //UPSERT keep old _id and only generate new _id for missing ones
        if (!mongoose.Types.ObjectId.isValid(data['_id'])) {
          data['_id'] = new mongoose.Types.ObjectId();
        }         
        uploadData.push(data);
       })

       .on("end", () => {        
        Promise
          .all(uploadData.map(item => {
            // console.log(item);
            return GkClient
              .findOneAndUpdate( 
                {_id: item._id }, 
                item, 
                { upsert: true, new: true }
              )
              .catch(error => ({error}));                        
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
            
            let message = `${(uploadData.length - errorArray.length)} / ${uploadData.length} items are upserted!`;            
                      
            let result = ({
              message: message,
              data: {
                "n": uploadData.length,
                "nModified": (uploadData.length - errorArray.length),
                "nErrors": errorArray.length,
                "errorDetails": errorArray,                
              },
            });

            if (uploadData.length - errorArray.length) {                                          
              const filename = uploadStatus.data.path.split('/');
              let trackHistory = GkClientsController.trackHistory(req, true, tcode, {}, filename[filename.length - 1]);  
            }

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

  patchCollective: async(req, res, patchType) => {
    try {
      console.log('...[1]Upload file to server');
      let fileService = new FilesService();
      let uploadStatus = await fileService.upload(req, res);
      // console.log(uploadStatus);
      
      console.log('...[2]Patching items in Database, type: ' + patchType);   
      let GkClient = await GkClientsController.getModel(req, res);

      let uploadFile = uploadStatus.data.path;
      let uploadData = [];            
      let errArray = [];    
      
      let tcode;
      let data;
      switch (patchType) {
        case 'disable':
          tcode = 'gkcln24';
          data = {status1: 'Inactive'};
          break;
        case 'enable':
          tcode = 'gkcln25';
          data = {status1: 'Active'};
          break;  
        case 'mark':
          tcode = 'gkcln26';
          data = {status2: 'Marked'};
          break;  
        case 'unmark':
          tcode = 'gkcln27';
          data = {status2: 'Unmarked'};
          break;  
        default:
          res.badRequest(res, {message: 'Invalid patch type!'});
          break;  
      }    
      
      var stream = fs.createReadStream(uploadFile);      

      fastCSV
       .fromStream(stream, { headers : true })

       .on("data", (data) => {
        if (mongoose.Types.ObjectId.isValid(data['_id'])) {
          uploadData.push(data['_id']);  
        }         
       })

       .on("end", () => {        
        Promise.resolve()
          .then(() => {
            // console.log(uploadData);            
            return GkClient.update( 
              {_id: { $in: uploadData} }, 
              data,
              { multi: true }               
            );            
          })
          
          .then(data => {
            // console.log(data); 
            
            let message = `${data.nModified} / ${data.n} items patched!`;
                      
            let result = ({
              message: message,
              data: data,
            });
            
            if (data.nModified) {                                          
              const filename = uploadStatus.data.path.split('/');
              let trackHistory = GkClientsController.trackHistory(req, true, tcode, {}, filename[filename.length - 1]);  
            }

            return response.ok(res, result);
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
  
  disableCollective: (req: express.Request, res: express.Response) => {    
    GkClientsController.patchCollective(req, res, 'disable');    
  },

  enableCollective: (req: express.Request, res: express.Response) => {    
    GkClientsController.patchCollective(req, res, 'enable');
  },

  markCollective: (req: express.Request, res: express.Response) => {    
    GkClientsController.patchCollective(req, res, 'mark');  
  },

  unmarkCollective: (req: express.Request, res: express.Response) => {    
    GkClientsController.patchCollective(req, res, 'unmark');  
  },

  deleteCollective: async(req: express.Request, res: express.Response) => {
    try {
      const tcode = 'gkcln28';

      console.log('...[1]Upload file to server');
      let fileService = new FilesService();
      let uploadStatus = await fileService.upload(req, res);
      // console.log(uploadStatus);

      console.log('...[2]Remove items from Database');  
      let GkClient = await GkClientsController.getModel(req, res);

      let uploadFile = uploadStatus.data.path;
      let uploadData = [];            
            
      var stream = fs.createReadStream(uploadFile);

      fastCSV
       .fromStream(stream, { headers : true })

       .on("data", (data) => {
          if (mongoose.Types.ObjectId.isValid(data['_id'])) {
            uploadData.push(data['_id']);  
          }                 
       })

       .on("end", () => {        
          Promise.resolve()
          .then(() => {
            //console.log(uploadData);            
            return GkClient.remove(
              { 
                _id: { $in: uploadData}, 
                status2: 'Marked'
              }
            );
          })
          
          .then(data => {
            // console.log(data.result.n);          
            
            let message = `${data.result.n} items removed!`;            
            
            let result = ({
              message: message,
              data: data.result,
            });
            
            if (data.result.n) {                                          
              const filename = uploadStatus.data.path.split('/');
              let trackHistory = GkClientsController.trackHistory(req, true, tcode, {}, filename[filename.length - 1]);  
            }

            return response.ok(res, result);
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

  history: async (req: express.Request, res: express.Response) => {
    
  },

  apiMasterList: async(req: express.Request, res: express.Response) => {

  }

}; // End of module

module.exports = GkClientsController;
