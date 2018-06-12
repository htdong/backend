"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var multer = require('multer');
var fs = require("fs-extra");
var path = require('path');
// INTERNAL
var ConstantsBase = require('../config/base/constants.base');
var helperService = require('../services/files.service');
var response = require('../services/response.service');
// var rootPath = path.join('/', 'Users', 'donghoang', 'node', 'gk', 'repo');
var sessionController = require('../modules/session/session.controller');
/**
* filesService
* Faciliate user activity on files
*
* @function upload
* @function uploadRequestDocument
*
* @function downloadCSV
* @function downloadRequestDocument
*/
var filesService = {
    /**
    * @function upload
    * Upload a file to server into right clientId/upload folder for further processing
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {promise}
    */
    upload: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // Keep uploaded file original name and extension
            const storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    const clientId = req['mySession'].clientId;
                    // console.log(clientId);
                    // const myPath = path.join(ConstantsBase.serverRepo, '/', clientId, '/upload');
                    const myPath = path.join(process.env.REPOSITORY, '/', clientId, '/upload');
                    // console.log(path);
                    cb(null, myPath);
                },
                filename: function (req, file, cb) {
                    cb(null, Date.now() + '-' + file.originalname);
                }
            });
            var uploadHandler = multer({ storage: storage }).single('file');
            uploadHandler(req, res, function (err) {
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
                };
                // console.log(fileInfo);
                const result = {
                    message: message,
                    data: req['file']
                };
                // console.log(result);
                resolve(result);
            });
        });
    }),
    /**
    * @function uploadRequestDocument
    * Upload a document of request to server into right request folder
    *
    * @param {express.Request} req
    * @param {express.Response} res
    *
    * @return {promise}
    */
    uploadRequestDocument: (req, res) => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // Keep uploaded file original name and extension
            const storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    var clientId = req['mySession'].clientId;
                    var docId = req.params._id;
                    // const myPath = rootPath + '/' + clientId + '/requests/' + docId;
                    // const myPath = path.join(ConstantsBase.serverRepo, clientId, 'requests', docId);
                    const myPath = path.join(process.env.REPOSITORY, clientId, 'requests', docId);
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
            var uploadHandler = multer({ storage: storage }).single('files');
            uploadHandler(req, res, function (err) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
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
                    };
                    console.log(fileInfo);
                    const result = {
                        message: '',
                        data: fileInfo
                    };
                    resolve(result);
                }
            });
        });
    }),
    /**
    * @function downloadCSV
    * Create a CSV file based on source and return a tempo link for download
    *
    * @param {express.Request}    req
    * @param {express.Response}   res
    * @param {csv}                csvData
    *
    * @return {object}            {filename: http://server/repo/download/filename.csv}
    * - 500
    */
    downloadCSV: (req, res, csvData) => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            console.log('Req params and query: ', req.params, req.query);
            const userFilename = req.query.filename || 'download';
            const filename = userFilename + '.csv';
            const dir = '../repo/download/';
            const path = dir + filename;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFile(path, csvData, function (err) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    const notification = {
                        tcode: 'dl',
                        id: '',
                        icon: 'file_download',
                        desc: filename + ' is ready for download!',
                        url: filename,
                        data: {
                            icon: 'file_download',
                            desc: filename + ' is ready for download!',
                            url: filename
                        },
                        username: req['mySession']['username'],
                        creator: 'system',
                        isMark: true
                    };
                    console.log('Confirm the file is ready for download: ', notification);
                    return resolve(notification);
                }
            });
        });
        // try {
        //   console.log('Req params and query: ', req.params, req.query);
        //   const userFilename = req.query.filename || 'download'
        //   const filename = userFilename + '.csv';
        //   const dir = '../repo/download/';
        //   const path = dir + filename;
        //
        //   if (!fs.existsSync(dir)){
        //     fs.mkdirSync(dir);
        //   }
        //
        //   fs.writeFile(path, csvData, function(err) {
        //     if (err) throw err;
        //
        //     const notification = {
        //       tcode: 'dl',
        //       id: '',
        //       icon: 'file_download',
        //       desc: filename + ' is ready for download!',
        //       url: filename,
        //       data: {
        //         icon: 'file_download',
        //         desc: filename + ' is ready for download!',
        //         url: filename
        //       },
        //       username: req['mySession']['username'],
        //       creator: 'system',
        //       isMark: true
        //     }
        //
        //     console.log('Confirm the file is ready for download: ' , notification);
        //     return Promise.resolve(notification);
        //   });
        //
        // }
        //
        // catch(error) {
        //   const result = {
        //     code: error.code || 500,
        //     message: error.message,
        //     data: "Download failed"
        //   }
        //   return response.fail_serverError(res, result);
        // }
    }),
    /**
    * @function downloadRequestDocument
    * Copy a document of request to dedicated downloadable folder and return link for download
    *
    * @param {express.Request}    req
    * @param {express.Response}   res
    * @param {file info}          requestFile
    *
    * @return {object}            {filename: http://server/repo/download/filename.csv}
    * - 500
    */
    downloadRequestDocument: (req, res, requestFile) => __awaiter(this, void 0, void 0, function* () {
        try {
            // const sourceFile = rootPath +  + '/requests/' + requestFile.docId + '/' + requestFile.uploadedname;
            // const sourceFile = path.join(ConstantsBase.serverRepo, req['mySession'].clientId, 'requests', requestFile.docId, requestFile.uploadedname);
            const sourceFile = path.join(process.env.REPOSITORY, req['mySession'].clientId, 'requests', requestFile.docId, requestFile.uploadedname);
            console.log('Source file exist?', fs.existsSync(sourceFile));
            // const destDir = path.join(ConstantsBase.serverRepo, 'download');
            const destDir = path.join(process.env.REPOSITORY, 'download');
            // const destDir = '../repo/download/';
            console.log('Destination dir exist?', fs.existsSync(destDir));
            const destFile = path.join(destDir, requestFile.originalname);
            console.log('Destination file exist?', fs.existsSync(destFile));
            if (!fs.existsSync(destDir)) {
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
            return requestFile.originalname;
        }
        catch (error) {
            const result = {
                code: error.code || 500,
                message: error.message,
                data: "Download failed"
            };
            return response.fail_serverError(res, result);
        }
    }),
};
module.exports = filesService;
