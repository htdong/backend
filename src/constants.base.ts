/**
* @module ConstantBase
* @description Singleton provide shared information on:
* - web server url address
* - data server url addresses
* - secret/ token
* - repository path
* - mail information
*/
var ConstantsBase = {
  // web server url address
  apiUrl:         "http://localhost:4000",

  // data server url addresses
  urlMongo:       "mongodb://localhost:27017/",
  urlSessionDb:   "mongodb://localhost:27017/gkSession",
  urlSystemDb:    "mongodb://localhost:27017/gksbs",

  // secret/ token
  secret:         "REPLACE THIS WITH YOUR OWN SECRET, IT CAN BE ANY STRING",
  sessionSecret:  "Something Here",

  // repository path
  serverRepo:     "/Users/donghoang/node/gk/repo",

  // mail information
  mailService:    "Gmail",
  mailUser:       "gkbps.services@gmail.com",
  mailPassword:   "dare.to@FAIL"
};

module.exports = ConstantsBase;
