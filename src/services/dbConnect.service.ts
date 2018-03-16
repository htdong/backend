var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
var response = require('./response.service');

var DBConnect = {
  connectSystemDB: async(req, res, model, schema) => {
    try {
      const ConstantsBase = require('../config/base/constants.base');
      const systemDbUri = ConstantsBase.urlSystemDb;
      const systemDb = await mongoose.createConnection(
        systemDbUri,
        { useMongoClient: true, promiseLibrary: require("bluebird")}
      );
      return systemDb.model(model, schema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.handle_server_error(res, err);
    }
  },

  connectMasterDB: async(req, res, clientCode, model, schema) => {
    try {
      const ConstantsBase = require('../config/base/constants.base');
      const DbUri = ConstantsBase.urlMongo;
      const masterDb = await mongoose.createConnection(
        DbUri + clientCode +"_0000",
        {
          useMongoClient: true,
          promiseLibrary: require("bluebird")
        }
      );
      return masterDb.model(model, schema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.fail_serverError(res, err);
    }
  },

  connectYearDB: async(req, res, clientCode, year, model, schema) => {
    try {
      const ConstantsBase = require('../config/base/constants.base');
      const DbUri = ConstantsBase.urlMongo;
      const yearDb = await mongoose.createConnection(
        DbUri + clientCode + "_" + year,
        {
          useMongoClient: true,
          promiseLibrary: require("bluebird")
        }
      );
      return yearDb.model(model, schema);
    }
    catch (err) {
      err['data'] = 'Error in connecting server and create collection model!';
      return response.fail_serverError(res, err);
    }
  },

  closeDB: async(req, res, DBConnection) => {
    try {
      if (DBConnection) {
        DBConnection.close()
          .then(() => console.log('System DB is closed!'))
          .catch((err) => {
            throw new Error('Failed to close system DB. Error: ' + err.message)
          });
      }
    }
    catch (err) {
      return response.handle_server_error(res, err);
    }
  },
}

module.exports = DBConnect;
