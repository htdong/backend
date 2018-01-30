// External
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// Schema
var GkRequestSchema = new Schema ({
  tcode: {
    type: String,
    required: true,
    minlength: 3
  },
  desc: {
    type: String,
    required: true,
  },
  remark: String,
  status: String,
  step: String,
  requestor: {
    fullname: String,
    username: String
  },
  owner: [String],
  approved: [],
  pic: {
    fullname: String,
    username: String
  },
  planned: String,
  next: [],
  id: String,
  approval_type: {},
  approval: [],
  docs: [],
  created_at: Date,
  updated_at: Date,
}, { collection: 'requests' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
GkRequestSchema.pre('save', function (next) {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

GkRequestSchema.plugin(mongoosePaginate);
GkRequestSchema.index({'$**': 'text'});
/*
GkRequestSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = GkRequestSchema;
