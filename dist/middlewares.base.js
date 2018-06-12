"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require('chalk');
console.log('%s 3. Middlewares Initialized!', chalk.green('✓'));
// EXTERNAL
const express = require("express");
const expressJwt = require("express-jwt");
const expressValidator = require("express-validator");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const compression = require('compression');
// INTERNAL
const ConstantsBase = require('./constants.base');
const routesBase = require('./routes.base');
/**
* @description Define configuration for server set up
*/
const configuration = () => {
    const app = express();
    const serveStatic = require("serve-static");
    const sessionController = require('./modules/session/session.controller');
    // PLUG-IN:  Express use 3rd parties Middlewares
    app.use(helmet());
    app.use(compression());
    app.use(cors({ credentials: true }));
    // app.use(function(req, res, next) { //allow cross origin requests
    //     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, OPTIONS, DELETE");
    //     res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     res.header("Access-Control-Allow-Credentials", 'true');
    //     next();
    // });
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(expressValidator());
    // PULUG-IN: Express use custom Middlewares
    // EXPRESS-JWT VALIDATION
    // POSTMAN Test: Remember to temporarily block below for POSTMAN test
    var myFilter = (req) => {
        const unlessArray = [
            '/',
            '/users/authenticate',
            '/users/register',
            '/users/forgot'
        ];
        //console.log(unlessArray.indexOf(req.path));
        const urls = req.path.split("/");
        //console.log(urls[1]);
        if ((unlessArray.indexOf(req.path) != -1) || (urls[1] == 'repo')) {
            return true;
        }
        return false;
    };
    app.use(expressJwt({ secret: process.env.JWT_SECRET }).unless(myFilter));
    app.use((req, res, next) => {
        let urls = req.path.split("/");
        console.log(`
----------------------------------------------------------------
REQUEST INFO SUMMARY:
----------------------------------------------------------------
[1] URLs:         ${req.path}
[2] METHOD:       ${req.method}
[3] URLs PARTS:   ${JSON.stringify(urls)}
[4] TOKEN:
  - In headers:   ${req.headers.token}
  - In body:      ${req.body.token}
[5] ARRAY WEB TOKEN (AWT[0]=wklge; AWT[1]=wkyear) ${req.headers.awt}
[6] UserId:       ${req.headers.usr}
[7] OPTIONS:      ${req.body.option}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
PROGRESS INFO:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `);
        next();
    });
    /**
     * CUSTOM SESSION MANAGEMENT
     * Retrieve session before processing request
     *
     * Notes on session
     * [1] DB:                        gkSession
     * [2] Collection:                token (~ client [mongodb] id)
     * [3] Session                    userid (store in req.headers.usr)
     *
     * Session store following information:
     * - User's right population after authentication
     * - Cache of user info and other session data
     * - TTL or Expiry concept
     * - Separate of concerns (session vs user) for easy maintenance
     */
    app.use((req, res, next) => {
        if (req.headers.usr && req.headers.awt) {
            sessionController.get(req, res)
                .then((mySession) => {
                req['mySession'] = mySession;
                // console.log(req['mySession']);
                next();
            })
                .catch((err) => {
                console.log('Error: ', err);
                res.status(400).send(err.message);
            });
        }
        else {
            // Important: More processing is required for the current request
            next();
        }
    });
    app.use(routesBase.routes());
    return app;
};
module.exports = {
    configuration: configuration
};
