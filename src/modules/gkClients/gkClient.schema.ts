// External
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// Schema
var GkClientSchema = new Schema ({
  name: {
    type: String,
    required: true,
    minlength: 5
  },
  clientDb: {
    type: String,
    required: true,
    unique: true
  },
  industry: String,
  service: String,
  addresses: [],
  contacts: [],
  solutions: [
    {
      type: String,
      ref: 'solutions'
    }
  ],
  setting: {
    maxUploadSize: Number
  },
  remarks: [],
  status1: { type: String },
  status2: { type: String },
  created_at: Date,
  updated_at: Date,
}, { collection: 'clients' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
GkClientSchema.pre('save', function (next) {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

GkClientSchema.plugin(mongoosePaginate);
GkClientSchema.index({'$**': 'text'});
/*
GkClientSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = GkClientSchema;
