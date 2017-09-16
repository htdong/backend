console.log('...Loading [Routes]');

// External
import express = require("express");

// Internal
var GkClientsRoutes = require('../../modules/gkClients/gkClients.route');
var UsersRoutes = require('../../modules/users/users.route');

var app = express();

class RoutesBase {

    get routes() {

        let router = express.Router();
        router.get('/', (req, res, next) => {
          res.json({
            message: 'Hello World. I am the API Restful server for GKSBS!'
          });
        });
        app.use('/', router);

        app.use("/gkClients", GkClientsRoutes);
        app.use("/users", UsersRoutes);

        return app;
    }
}

export = RoutesBase;
