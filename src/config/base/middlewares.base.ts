console.log('...Loading [Middlewares]');

// EXTERNAL
import * as express from 'express';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as expressJwt from 'express-jwt';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';

var compression = require('compression')

// INTERNAL
var ConstantsBase = require('./constants.base');
var routesBase = require('./routes.base');

var configuration = () => {
  const app = express();
  const serveStatic = require("serve-static");
  const sessionController = require('../../modules/session/session.controller');

  // Plug into express with 3rd parties Middlewares
  app.use(helmet());
  app.use(compression());

  app.use(cors({ credentials: true }));
  // app.use(function(req, res, next) { //allow cross origin requests
  //     res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  //     res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //     res.header("Access-Control-Allow-Credentials", 'true');
  //     next();
  // });

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Plug into express with custom Middlewares

  // POSTMAN Test: Remember to temporarily block below for POSTMAN test
  var myFilter = (req) => {
    const unlessArray = [
      '/',
      '/users/authenticate',
      '/users/register',
      '/users/forgot',
      '/graphql',
      'graphiql',
      // '/repo/download/:id'
    ];
    // '/requestFiles/upload'
    //console.log(unlessArray.indexOf(req.path));

    const urls = req.path.split("/");
    //console.log(urls[1]);

    if ((unlessArray.indexOf(req.path)!=-1)||(urls[1]=='repo')) {
      return true;
    }
    return false;
  }

  app.use(expressJwt({ secret: ConstantsBase.secret }).unless(myFilter));

  app.use((req, res, next) => {


    let urls = req.path.split("/");
    console.log(`
----------------------------------------------------------------
NEW REQUEST INFO:
----------------------------------------------------------------
[1] URLs:         ${req.path}
[2] METHOD:       ${req.method}
[3] OPTIONS:      ${req.body.option}
[4] URLs PARTS:   ${JSON.stringify(urls)}
[5] TOKEN:
  - In headers:   ${req.headers.token}
  - In body:      ${req.body.token}
[6] ARRAY WEB TOKEN (AWT[0]=wklge; AWT[1]=wkyear) ${req.headers.awt}
[7] UserId:       ${req.headers.usr}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
PROGRESS INFO:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `);

    /**
    * RETRIEVE SESSION INFORMATION BEFORE PROCESSING REQUEST
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

    if (req.headers.usr && req.headers.awt) {
      sessionController.get(req, res)
        .then((mySession)=>{
          req['mySession'] = mySession;
          // console.log(req['mySession']);
          next();
        })
        .catch((err)=>{
          console.log('Error: ', err);
          res.status(400).send(err.message);
        });
    } else {
      // Important: More processing is required for the current request
      next();
    }
  });

  app.use(routesBase.routes());

  return app;
}

module.exports = {
  configuration: configuration
}
