// External
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Schema
var SessionSchema = new Schema ({
  username: { type: String },
  clientId: { type: String },
  wklge: { type: String },
  wkyear: { type: String },
  tcodes: [],
  setting: {
    maxUploadSize: Number
  }
});

module.exports = SessionSchema;
