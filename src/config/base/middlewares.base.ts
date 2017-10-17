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
import  { SimpleHash } from '../../services/simpleHash.service';

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
    var myFilter = (req) => {
      const unlessArray = [
        '/',
        '/users/authenticate',
        '/users/register',
        '/users/forgot',
      ];
      //console.log(unlessArray.indexOf(req.path));

      const urls = req.path.split("/");
      //console.log(urls[1]);

      if ((unlessArray.indexOf(req.path)!=-1)||(urls[1]=='repo')) {
        return true;
      }
      return false;
    }

    app.use(expressJwt({ secret: ConstantsBase.secret }).unless(myFilter));

    /*
     * Session Parameters
     * [1] DB (gkcSession)            FIXED
     * [2] Collection                 client id = token
     * [3] Session (userId)           req.headers.usr
     * Session Store
     * - User's right population after authentication
     * - Cache of user info and other session data
     * - TTL or Expiry concept
     * - Separate of concerns (session vs user) and easy maintenance
     */

    app.use((req, res, next) => {
      let simpleHash = new SimpleHash();
      let urls = req.path.split("/");
      console.log(`
--------------------------------
NEW REQUEST INFO:
[1] Request: ${req.path}
[2] Method:  ${req.method}
[3] Option:  ${req.body.option}
[4] Params:  ${JSON.stringify(urls)}
[5] Token:
    - In headers: ${req.headers.token}
    - In body:    ${req.body.token}
[6] Array Web Token (AWT[0]=wklge; AWT[1]=wkyear): ${req.headers.awt}
[7] Userid: ${req.headers.usr}
--------------------------------
PROGRESS INFO:
      `);

      if (req.headers.usr && req.headers.awt) {
        sessionController.get(req, res)
          .then((mySession)=>{
            req['mySession'] = mySession;
            //console.log(req['mySession']);
            next();
          })
          .catch((err)=>{
            console.log(err);
            res.status(400).send(err.message);
          });
      } else {
        // Important: More processing is required for the current request
        next();
      }
    });

    app.use(new RoutesBase().routes);

    return app;

  }

};

Object.seal(MiddlewaresBase);
export = module.exports = MiddlewaresBase;
