import * as http from 'http';
import * as debug from 'debug';

import App from './App';

debug('ts-express:server');

/**
 * Get port from environment and sote in Express
 */
const port = normalizePort(process.env.PORT || 4000);
App.set('port', port);

/**
 * Create HTTP server
 */
const server = http.createServer(App);

/**
 * Listen on provided port, on all network interface
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string or false
 */
function normalizePort(val: number|string): number|string|boolean {
  let port: number = (typeof val === 'string')
    ? parseInt(val, 10)
    : val;
  if (isNaN(port)) {
    return val;
  }
  else {
    if (port >= 0) { return port; }
    else { return false; }
  }
}

/**
 * Event listener for HTTP Server "error" event
 */

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') { throw error; }

  let bind = (typeof port === 'string')
    ? 'Pipe ' + port
    : 'Port ' + port;

  // Handle specific listen errors with friendly messages
  switch(error.code) {
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
function onListening(): void {
  let addr = server.address();
  let bind = (typeof addr === 'string')
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  console.log(`...Server Listening on ${bind}`);
  debug(`Listening on ${bind}`);
}
