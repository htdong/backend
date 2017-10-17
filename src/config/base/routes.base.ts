console.log('...Loading [Routes]');

// External
import express = require("express");

// Internal
var UsersRoutes = require('../../modules/users/users.route');
var GkClientsRoutes = require('../../modules/gkClients/gkClients.route');
var SessionRoutes = require('../../modules/session/session.route')

var app = express();
var path = require('path');
var serveStatic = require('serve-static');

class RoutesBase {

    get routes() {

        // API restful introduction
        let router = express.Router();
        router.get('/', (req, res, next) => {
          res.json({
            message: 'Hello World. I am the API Restful server for GKSBS!'
          });
        });
        app.use('/', router);

        // API restful services
        app.use("/users", UsersRoutes);
        app.use("/gkClients", GkClientsRoutes);
        app.use("/settings", SessionRoutes)

        // Static files
        app.use(serveStatic(path.join('/Users/donghoang/node/gk')));

        return app;
    }
}

export = RoutesBase;
