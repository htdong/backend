// External
import express = require("express");
var multer = require('multer');
var fs = require("fs");

// Internal
var sessionController = require('../modules/session/session.controller');
var response = require('../services/response.service');

class FilesService {

  constructor() { }

  upload(req: express.Request, res: express.Response) {

    return new Promise((resolve, reject) => {

      // Keep uploaded file original name and extension
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          var clientId = req['mySession'].clientId;
          // console.log(clientId);
          const path = '/Users/donghoang/node/gk/repo/' + clientId + '/upload';
          // console.log(path);
          cb(null, path);
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname)
        }
      });

      var uploadHandler = multer({storage: storage}).single('file');

      uploadHandler(req, res, function(err) {
        if (err) {
          console.log(err);
          reject(err);
        }

        const message = "Upload completed for " + req['file'].path;

        const fileInfo = {
          fieldname: req['file'].fieldname,
          originalname: req['file'].originalname,
          encoding: req['file'].encoding,
          mimetype: req['file'].mimetype,
          size: req['file'].size,
          destination: req['file'].destination,
          filename: req['file'].filename,
          path: req['file'].path
        }
        // console.log(fileInfo);

        const result = {
          message: message,
          data: req['file']
        }

        resolve(result);
      });
    })

  }

  async downloadCSV(req, res, csvData) {
    try {
      const clientId = req['mySession'].clientId;
      const userFilename = req.query.filename || 'download'
      const filename = userFilename + '.csv';
      // const path = '../repo/' + clientId + '/download/' + filename;
      const dir = '../repo/download/';
      const path = dir + filename;

      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }

      fs.writeFile(path, csvData, function(err) {
        if (err) throw err;
        console.log('Send file address to client for downloading');
        res.json({filename: filename});
      });      
      
    }

    catch(error) {
      const result = {
        code: error.code || 500,
        message: error.message,
        data: "Download failed"
      }
      return response.serverError(res, result);      
    }
    
  }

  
  async upload1(req: express.Request, res: express.Response) { 
    try {      
      // Keep uploaded file original name and extension
      const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          let clientId = req['mySession'].clientId;
          //console.log(clientId);
          const path = '/Users/donghoang/node/gk/repo/' + clientId + '/upload';
          //console.log(path);
          cb(null, path);
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname)
        }
      });

      let uploadHandler = multer({storage: storage}).single('file');

      let message = "Upload completed for ";
      
      await uploadHandler(req, res, (err)=>{
        if (err) {
          console.log(err);          
        }
      });

      let filename = req['file'];
      /*
        message += req['file'].path;
        //console.log(message);
        
        let fileInfo = {
          fieldname: req['file'].fieldname,
          originalname: req['file'].originalname,
          encoding: req['file'].encoding,
          mimetype: req['file'].mimetype,
          size: req['file'].size,
          destination: req['file'].destination,
          filename: req['file'].filename,
          path: req['file'].path
        }        
        // console.log(req['file']);          
        const result = {
          message: message,
          data: fileInfo
        }
        console.log(result);
        return result;
      });
      */
      
      const result = {
        message: message,
        data: {}
      }
      console.log(filename);
      return result;

    }
    catch (error) {
      var response = {
        code: error.code || 500,
        message: error.message || '',
        data: error.data || {}
      };
      return res.status(500).json(response);		
    }
      
  }

}

export = FilesService;
