import * as express from 'express';

const chalk = require('chalk');
console.log('%s 2. App Initialized!', chalk.green('✓'));

/* MIDDLEWARES Initialization */
const middlewaresBase = require('./middlewares.base')

module.exports = express().use(middlewaresBase.configuration())
