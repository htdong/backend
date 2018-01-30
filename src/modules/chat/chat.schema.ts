// External
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Schema
var ChatSchema = new Schema ({
  id: {type: String},
  img: {type: String},
  rid: {type: String},
  text: {type: String},
  date: {type: Date},
  updated_at: { type: Date, default: Date.now },
});

module.exports = ChatSchema;
