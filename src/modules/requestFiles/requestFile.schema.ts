// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// SCHEMA
var RequestFileSchema = new Schema ({
  docId: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  uploadedname: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true,
  },
  size: {
    type: Number
  },
  encoding: String,
  mimetype: String,
  username: {
    type: String,
    required: true
  },
  status: { type: String },
  created_at: Date,
  updated_at: Date,
}, { collection: 'uploadFiles' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
RequestFileSchema.pre('save', function (next) {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

RequestFileSchema.plugin(mongoosePaginate);
RequestFileSchema.index({'$**': 'text'});
/*
GkClientSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = RequestFileSchema;
