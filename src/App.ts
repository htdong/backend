import * as express from 'express'

var middlewaresBase = require('./config/base/middlewares.base')

module.exports = express().use(middlewaresBase.configuration())
