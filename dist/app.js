"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const chalk = require('chalk');
console.log('%s 2. App Initialized!', chalk.green('✓'));
/* MIDDLEWARES Initialization */
const middlewaresBase = require('./middlewares.base');
module.exports = express().use(middlewaresBase.configuration());
