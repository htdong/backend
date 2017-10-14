// External
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Schema
var SessionSchema = new Schema ({
  tcodes: [],
  wklge: {type: String},
  wkyear: {type: String},
});

module.exports = SessionSchema;
