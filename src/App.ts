// External packages
import * as path from 'path';
import * as express from 'express';

import MiddlewaresBase = require('./config/base/middlewares.base');

class App {

  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.express.use(MiddlewaresBase.configuration);
  }

}

export default new App().express;
