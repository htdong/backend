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
    app.use(helmet());
    app.use(cors());
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

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
      console.log('--------------------------------');
      console.log(`REQUEST INFO:
[1] Request: ${req.path}
[2] Method:  ${req.method}
[3] Option:  ${req.body.option}
[4] Params:  ${JSON.stringify(urls)}
[5] Received:${Date.now()}
[6] AWT: ${req.headers.awt}`);
        console.log('--------------------------------');
        console.log('PROGRESS INFO:');

      // Do necessary checking here
      // console.log(`After, initialize Session: ${initSession}`);

      // Important: More processing is required for the current request
      next();
    });

     app.use(new RoutesBase().routes);
     return app;
  }

};

Object.seal(MiddlewaresBase);
export = module.exports = MiddlewaresBase;
