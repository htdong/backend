console.log('...Loading [Middlewares]');

// External packages
import * as express from 'express';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as expressJwt from 'express-jwt';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';

// Internal packages
var ConstantsBase = require('./constants.base');
var DB = require('../../services/dbConnection.service');
var RoutesBase = require('./routes.base');

class MiddlewaresBase {

  static get configuration() {
    var app = express();
    var serveStatic = require("serve-static");
    var sessionController = require('../../modules/session/session.controller');

    app.use(helmet());
    app.use(cors({ credentials: true }));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // Temporarily block for POSTMAN test
    app.use(expressJwt({ secret: ConstantsBase.secret })
      .unless({ path: [
        '/',
        '/users/authenticate',
        '/users/register',
        '/users/forgot']
      })
    );

    app.use((req, res, next) => {
      let urls = req.path.split("/");
      console.log(`
--------------------------------
NEW REQUEST INFO:
[1] Request: ${req.path}
[2] Method:  ${req.method}
[3] Option:  ${req.body.option}
[4] Params:  ${JSON.stringify(urls)}
[5] Received:${Date.now()}
[6] Array Web Token [AWT]: ${req.headers.awt}
[7] User Id: ${req.headers.usr}
--------------------------------
Progress Info:
      `);

      /*
       * Session Store
       * [1] DB (gkcSession)            FIXED
       * [2] Collection (clientcode)    decode_array(req.headers.awt[0])
       * [3] Session (userId)           req.headers.usr
       * Decision: [1]
       * - To calculate user's right population after authentication
       * - To cache the latest user info and other session data separately
       * - To implement TTL or Expiry concept
       * - To separate of concerns (session vs user) and easy maintenance
       */
      if (req.headers.usr && req.headers.awt) {
        sessionController.get(req, res)
          .then((mySession)=>{
            req['mySession'] = mySession;
            // console.log(req['mySession']);
          })
          .catch((err)=>{
            console.log(err);
            res.status(400).send(err.message);
          });
      }

      // Important: More processing is required for the current request
      next();
    });

     app.use(new RoutesBase().routes);
     return app;
  }

};

Object.seal(MiddlewaresBase);
export = module.exports = MiddlewaresBase;
