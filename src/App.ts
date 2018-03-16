// External packages
import * as path from 'path';
import * as express from 'express';

var MiddlewaresBase = require('./config/base/middlewares.base');

// console.log(MiddlewaresBase.configuration);

// CommonJS
module.exports = express().use(MiddlewaresBase.configuration());

// ES6 Class
// class App {
//
//   // ref to Express instance
//   public express: express.Application;
//
//   //Run configuration methods on the Express instance.
//   constructor() {
//     this.express = express();
//     this.express.use(MiddlewaresBase.configuration);
//   }
//
// }
//
// export default new App().express;
