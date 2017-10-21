// External
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Schema
var SessionSchema = new Schema ({
  clientId: {type: String},
  wklge: {type: String},
  wkyear: {type: String},
  tcodes: [],
});

module.exports = SessionSchema;