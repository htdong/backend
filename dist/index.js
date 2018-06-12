"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
// const debug = require('debug');
// debug('ts-express:server');
/* ENVIRONMENT */
const dotenv = require('dotenv');
dotenv.load({ path: '.env.example' });
const chalk = require('chalk');
console.log('%s 1. Server Initialized!', chalk.green('✓'));
/* APP Initialization */
const fpApp = require('./app');
/**
 * A. NODEJS SERVER SET UP
 * 1. Get port from environment
 * 2. Create custom HTTP server
 * 3. Listen on provided port, on all network interface
 */
/* A.1 */
const port = normalizePort(process.env.PORT || 4200);
fpApp.set('port', port);
/* A.2 */
const server = http.createServer(fpApp);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
/**
 * B. SUPPORTING FUNCTIONS
 *
 * @function normalizePort
 * @function onError
 * @function onListening
 */
/**
 * Normalize a port into a number, string or false
 *
 * @param {number | string} val
 * @return {number|string|boolean}
 */
function normalizePort(val) {
    let port = (typeof val === 'string')
        ? parseInt(val, 10)
        : val;
    if (isNaN(port)) {
        return val;
    }
    else {
        if (port >= 0) {
            return port;
        }
        else {
            return false;
        }
    }
}
/**
* Event listener for HTTP Server "error" event
*
* @param error
*/
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    let bind = (typeof port === 'string')
        ? 'Pipe ' + port
        : 'Port ' + port;
    // Handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
* Event listener for HTTP server "listening" event
*/
function onListening() {
    let addr = server.address();
    let bind = (typeof addr === 'string')
        ? `pipe ${addr}`
        : `port ${addr.port}`;
    console.log('%s Server Listening on %s', chalk.green('✓'), bind);
    // debug(`Listening on ${bind}`);
}
