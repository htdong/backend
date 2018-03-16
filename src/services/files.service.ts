// External
import express = require("express");
var multer = require('multer');
var fs = require("fs-extra");
var path = require('path');

var helperService = require('../services/files.service');
// import  { HelperService } from '../../services/helper.service';

// Internal
var sessionController = require('../modules/session/session.controller');
var response = require('../services/response.service');
var rootPath = path.join('/', 'Users', 'donghoang', 'node', 'gk', 'repo');

// CommonJS
var filesService1 = {

  /**
  * @function upload
  * Upload a file to server into right clientId/upload folder for further processing
  *
  * @param {express.Request} req
  * @param {express.Response} res
  *
  * @return {promise}
  * - reject
  * - resolve
  */

  upload: async(req: express.Request, res: express.Response) => {

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
          cb(null, Date.now() +'-'+file.originalname);

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

  },

  uploadRequestFile: async(req: express.Request, res: express.Response) => {

    return new Promise((resolve, reject) => {

      // Keep uploaded file original name and extension
      const storage = multer.diskStorage({

        destination: function (req, file, cb) {
          var clientId = req['mySession'].clientId;
          var docId = req.params._id;
          // const myPath = rootPath + '/' + clientId + '/requests/' + docId;
          const myPath = path.join(rootPath, clientId, 'requests', docId);

          // If directory path does not exist, create a new one -
          // Must be sure /Users/donghoang/node/gk/repo/' + clientId + '/requests/ already exist
          if (!fs.existsSync(myPath)) {
              fs.mkdirSync(myPath);
          }

          cb(null, myPath);
        },
        filename: function (req, file, cb) {
          cb(null, Date.now() + '-' + file.originalname);
        }
      });

      var uploadHandler = multer({storage: storage}).single('files');

      uploadHandler(req, res, function(err) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          const fileInfo = {
            fieldname: req['file'].fieldname,
            docId: req.params._id,
            originalname: req['file'].originalname,
            uploadedname: req['file'].filename,
            desc: req['file'].originalname,
            size: req['file'].size,
            encoding: req['file'].encoding,
            mimetype: req['file'].mimetype,
            username: req['mySession'].username,
            status: 'Unmarked',
            destination: req['file'].destination,
            localpath: req['file'].path
          }
          console.log(fileInfo);

          const result = {
            message: '',
            data: fileInfo
          }

          resolve(result);
        }

      });
    })

  },

  /**
  * @function downloadCSV
  * Create CSV file based on source and create a tempo link for client download
  *
  * @param {express.Request} req
  * @param {express.Response} res
  * @param {csv} csvData
  *
  * @return {object} {filename: http://server/repo/download/filename.csv}
  * - 500
  */

  downloadCSV: async(req, res, csvData) => {
    try {
      const userFilename = req.query.filename || 'download'
      const filename = userFilename + '.csv';
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
  },

  downloadRequestFile: async(req, res, requestFile) => {
    try {
      // const sourceFile = rootPath +  + '/requests/' + requestFile.docId + '/' + requestFile.uploadedname;
      const sourceFile = path.join(rootPath, req['mySession'].clientId, 'requests', requestFile.docId, requestFile.uploadedname);
      console.log('Source file exist?', fs.existsSync(sourceFile));

      const destDir = path.join(rootPath, 'download');
      // const destDir = '../repo/download/';
      console.log('Destination dir exist?', fs.existsSync(destDir));

      const destFile = path.join(destDir, requestFile.originalname);
      console.log('Destination file exist?', fs.existsSync(destFile));

      if (!fs.existsSync(destDir)){
        fs.mkdirSync(destDir);
      }

      console.log('Source: ', sourceFile);
      console.log('Destination: ', destFile);

      // If file exist do not copy again
      if (!fs.existsSync(destFile)) {
        // Async
        fs.copy(sourceFile, destFile)
          .then(() => {
            console.log('Destination file exist?', fs.existsSync(destFile));
            console.log('Send file address to client for downloading', destFile);

            // const result = {
            //   message: '',
            //   data: requestFile.originalname
            // }
            //
            // response.ok(res, result);
          })
          .catch(err => console.error(err));
      } else {
        // const result = {
        //   message: '',
        //   data: requestFile.originalname
        // }
        // response.ok(res, result);
      }

      const notification = {
        tcode: 'tcode',
        id: 'id',
        data: {
          desc: 'File is ready for download!',
          url: requestFile.originalname
        },
        username: 'username',
        creator: 'system',
        isMark: true
      }

      helperService.log(notification);

      // let a = await notificationsController.module1x(req, res, notification);

      const result = {
        message: '',
        data: requestFile.originalname
      }
      response.ok(res, result);
    }
    catch(error) {
      const result = {
        code: error.code || 500,
        message: error.message,
        data: "Download failed"
      }
      return response.serverError(res, result);
    }

  },

  downloadRequestDocument: async(req, res, requestFile) => {
    try {
      // const sourceFile = rootPath +  + '/requests/' + requestFile.docId + '/' + requestFile.uploadedname;
      const sourceFile = path.join(rootPath, req['mySession'].clientId, 'requests', requestFile.docId, requestFile.uploadedname);
      console.log('Source file exist?', fs.existsSync(sourceFile));

      const destDir = path.join(rootPath, 'download');
      // const destDir = '../repo/download/';
      console.log('Destination dir exist?', fs.existsSync(destDir));

      const destFile = path.join(destDir, requestFile.originalname);
      console.log('Destination file exist?', fs.existsSync(destFile));

      if (!fs.existsSync(destDir)){
        fs.mkdirSync(destDir);
      }

      console.log('Source: ', sourceFile);
      console.log('Destination: ', destFile);

      // If file exist do not copy again
      if (!fs.existsSync(destFile)) {
        // Async
        fs.copy(sourceFile, destFile)
          .then(() => {
            console.log('Destination file exist?', fs.existsSync(destFile));
            console.log('Send file address to client for downloading', destFile);
          })
          .catch(err => console.error(err));
      }

      return requestFile.originalname
    }
    catch(error) {
      const result = {
        code: error.code || 500,
        message: error.message,
        data: "Download failed"
      }
      return response.serverError(res, result);
    }

  },

  upload1: async(req: express.Request, res: express.Response) => {
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

module.exports = filesService1;

// ES6
// var rootPath = '/Users/donghoang/node/gk/repo/';
// class FilesService {
//
//   constructor() {
//     rootPath = path.join('/', 'Users', 'donghoang', 'node', 'gk', 'repo');
//     console.log(rootPath);
//   }
//
//   /**
//   * @function upload
//   * Upload a file to server into right clientId/upload folder for further processing
//   *
//   * @param {express.Request} req
//   * @param {express.Response} res
//   *
//   * @return {promise}
//   * - reject
//   * - resolve
//   */
//
//   upload(req: express.Request, res: express.Response) {
//
//     return new Promise((resolve, reject) => {
//
//       // Keep uploaded file original name and extension
//       const storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//           var clientId = req['mySession'].clientId;
//           // console.log(clientId);
//           const path = '/Users/donghoang/node/gk/repo/' + clientId + '/upload';
//           // console.log(path);
//           cb(null, path);
//         },
//         filename: function (req, file, cb) {
//           cb(null, Date.now() +'-'+file.originalname);
//
//         }
//       });
//
//       var uploadHandler = multer({storage: storage}).single('file');
//
//       uploadHandler(req, res, function(err) {
//         if (err) {
//           console.log(err);
//           reject(err);
//         }
//
//         const message = "Upload completed for " + req['file'].path;
//
//         const fileInfo = {
//           fieldname: req['file'].fieldname,
//           originalname: req['file'].originalname,
//           encoding: req['file'].encoding,
//           mimetype: req['file'].mimetype,
//           size: req['file'].size,
//           destination: req['file'].destination,
//           filename: req['file'].filename,
//           path: req['file'].path
//         }
//         // console.log(fileInfo);
//
//         const result = {
//           message: message,
//           data: req['file']
//         }
//
//         resolve(result);
//       });
//     })
//
//   }
//
//   uploadRequestFile(req: express.Request, res: express.Response) {
//
//     return new Promise((resolve, reject) => {
//
//       // Keep uploaded file original name and extension
//       const storage = multer.diskStorage({
//
//         destination: function (req, file, cb) {
//           var clientId = req['mySession'].clientId;
//           var docId = req.params._id;
//           // const myPath = rootPath + '/' + clientId + '/requests/' + docId;
//           const myPath = path.join(rootPath, clientId, 'requests', docId);
//
//           // If directory path does not exist, create a new one -
//           // Must be sure /Users/donghoang/node/gk/repo/' + clientId + '/requests/ already exist
//           if (!fs.existsSync(myPath)) {
//               fs.mkdirSync(myPath);
//           }
//
//           cb(null, myPath);
//         },
//         filename: function (req, file, cb) {
//           cb(null, Date.now() + '-' + file.originalname);
//         }
//       });
//
//       var uploadHandler = multer({storage: storage}).single('files');
//
//       uploadHandler(req, res, function(err) {
//         if (err) {
//           console.log(err);
//           reject(err);
//         } else {
//           const fileInfo = {
//             fieldname: req['file'].fieldname,
//             docId: req.params._id,
//             originalname: req['file'].originalname,
//             uploadedname: req['file'].filename,
//             desc: req['file'].originalname,
//             size: req['file'].size,
//             encoding: req['file'].encoding,
//             mimetype: req['file'].mimetype,
//             username: req['mySession'].username,
//             status: 'Unmarked',
//             destination: req['file'].destination,
//             localpath: req['file'].path
//           }
//           console.log(fileInfo);
//
//           const result = {
//             message: '',
//             data: fileInfo
//           }
//
//           resolve(result);
//         }
//
//       });
//     })
//
//   }
//
//   /**
//   * @function downloadCSV
//   * Create CSV file based on source and create a tempo link for client download
//   *
//   * @param {express.Request} req
//   * @param {express.Response} res
//   * @param {csv} csvData
//   *
//   * @return {object} {filename: http://server/repo/download/filename.csv}
//   * - 500
//   */
//
//   async downloadCSV(req, res, csvData) {
//     try {
//       const userFilename = req.query.filename || 'download'
//       const filename = userFilename + '.csv';
//       const dir = '../repo/download/';
//       const path = dir + filename;
//
//       if (!fs.existsSync(dir)){
//         fs.mkdirSync(dir);
//       }
//
//       fs.writeFile(path, csvData, function(err) {
//         if (err) throw err;
//         console.log('Send file address to client for downloading');
//         res.json({filename: filename});
//       });
//
//     }
//
//     catch(error) {
//       const result = {
//         code: error.code || 500,
//         message: error.message,
//         data: "Download failed"
//       }
//       return response.serverError(res, result);
//     }
//   }
//
//   async downloadRequestFile(req, res, requestFile) {
//     try {
//       // const sourceFile = rootPath +  + '/requests/' + requestFile.docId + '/' + requestFile.uploadedname;
//       const sourceFile = path.join(rootPath, req['mySession'].clientId, 'requests', requestFile.docId, requestFile.uploadedname);
//       console.log('Source file exist?', fs.existsSync(sourceFile));
//
//       const destDir = path.join(rootPath, 'download');
//       // const destDir = '../repo/download/';
//       console.log('Destination dir exist?', fs.existsSync(destDir));
//
//       const destFile = path.join(destDir, requestFile.originalname);
//       console.log('Destination file exist?', fs.existsSync(destFile));
//
//       if (!fs.existsSync(destDir)){
//         fs.mkdirSync(destDir);
//       }
//
//       console.log('Source: ', sourceFile);
//       console.log('Destination: ', destFile);
//
//       // If file exist do not copy again
//       if (!fs.existsSync(destFile)) {
//         // Async
//         fs.copy(sourceFile, destFile)
//           .then(() => {
//             console.log('Destination file exist?', fs.existsSync(destFile));
//             console.log('Send file address to client for downloading', destFile);
//
//             // const result = {
//             //   message: '',
//             //   data: requestFile.originalname
//             // }
//             //
//             // response.ok(res, result);
//           })
//           .catch(err => console.error(err));
//       } else {
//         // const result = {
//         //   message: '',
//         //   data: requestFile.originalname
//         // }
//         // response.ok(res, result);
//       }
//
//       const notification = {
//         tcode: 'tcode',
//         id: 'id',
//         data: {
//           desc: 'File is ready for download!',
//           url: requestFile.originalname
//         },
//         username: 'username',
//         creator: 'system',
//         isMark: true
//       }
//
//       helperService.log(notification);
//
//       // let a = await notificationsController.module1x(req, res, notification);
//
//       const result = {
//         message: '',
//         data: requestFile.originalname
//       }
//       response.ok(res, result);
//     }
//     catch(error) {
//       const result = {
//         code: error.code || 500,
//         message: error.message,
//         data: "Download failed"
//       }
//       return response.serverError(res, result);
//     }
//
//   }
//
//   async downloadRequestDocument(req, res, requestFile) {
//     try {
//       // const sourceFile = rootPath +  + '/requests/' + requestFile.docId + '/' + requestFile.uploadedname;
//       const sourceFile = path.join(rootPath, req['mySession'].clientId, 'requests', requestFile.docId, requestFile.uploadedname);
//       console.log('Source file exist?', fs.existsSync(sourceFile));
//
//       const destDir = path.join(rootPath, 'download');
//       // const destDir = '../repo/download/';
//       console.log('Destination dir exist?', fs.existsSync(destDir));
//
//       const destFile = path.join(destDir, requestFile.originalname);
//       console.log('Destination file exist?', fs.existsSync(destFile));
//
//       if (!fs.existsSync(destDir)){
//         fs.mkdirSync(destDir);
//       }
//
//       console.log('Source: ', sourceFile);
//       console.log('Destination: ', destFile);
//
//       // If file exist do not copy again
//       if (!fs.existsSync(destFile)) {
//         // Async
//         fs.copy(sourceFile, destFile)
//           .then(() => {
//             console.log('Destination file exist?', fs.existsSync(destFile));
//             console.log('Send file address to client for downloading', destFile);
//           })
//           .catch(err => console.error(err));
//       }
//
//       return requestFile.originalname
//     }
//     catch(error) {
//       const result = {
//         code: error.code || 500,
//         message: error.message,
//         data: "Download failed"
//       }
//       return response.serverError(res, result);
//     }
//
//   }
//
//   async upload1(req: express.Request, res: express.Response) {
//     try {
//       // Keep uploaded file original name and extension
//       const storage = multer.diskStorage({
//         destination: (req, file, cb) => {
//           let clientId = req['mySession'].clientId;
//           //console.log(clientId);
//           const path = '/Users/donghoang/node/gk/repo/' + clientId + '/upload';
//           //console.log(path);
//           cb(null, path);
//         },
//         filename: (req, file, cb) => {
//           cb(null, file.originalname)
//         }
//       });
//
//       let uploadHandler = multer({storage: storage}).single('file');
//
//       let message = "Upload completed for ";
//
//       await uploadHandler(req, res, (err)=>{
//         if (err) {
//           console.log(err);
//         }
//       });
//
//       let filename = req['file'];
//       /*
//         message += req['file'].path;
//         //console.log(message);
//
//         let fileInfo = {
//           fieldname: req['file'].fieldname,
//           originalname: req['file'].originalname,
//           encoding: req['file'].encoding,
//           mimetype: req['file'].mimetype,
//           size: req['file'].size,
//           destination: req['file'].destination,
//           filename: req['file'].filename,
//           path: req['file'].path
//         }
//         // console.log(req['file']);
//         const result = {
//           message: message,
//           data: fileInfo
//         }
//         console.log(result);
//         return result;
//       });
//       */
//
//       const result = {
//         message: message,
//         data: {}
//       }
//       console.log(filename);
//       return result;
//
//     }
//     catch (error) {
//       var response = {
//         code: error.code || 500,
//         message: error.message || '',
//         data: error.data || {}
//       };
//       return res.status(500).json(response);
//     }
//
//   }
//
// }
//
// export = FilesService;
