console.log('...Pre-loading [Constants]');

var ConstantsBase = {
  urlMongo: "mongodb://localhost:27017/",
  urlSessionDb: "mongodb://localhost:27017/gkSession",
  urlSystemDb: "mongodb://localhost:27017/gksbs",
  apiUrl: "http://localhost:4000",
  secret: "REPLACE THIS WITH YOUR OWN SECRET, IT CAN BE ANY STRING",
  sessionSecret: "Something Here",
};

module.exports = ConstantsBase;
