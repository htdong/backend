// External
import express = require("express");
var multer = require('multer');

// Internal
var sessionController = require('../modules/session/session.controller');

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

        /*
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
        */

        const result = {
          message: message,
          data: req['file']
        }

        resolve(result);
      });
    })

  }

}

export = FilesService;
