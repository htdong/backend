// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// SCHEMA
var RequestApprovalHistorySchema = new Schema ({
  docId: String,
  username: String,
  multi: Boolean,
  tcode: String,
  diff: [],
  created_at: Date,
}, { collection: 'requestApprovalHistory' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
RequestApprovalHistorySchema.pre('save', function (next) {
  let currentDate = new Date();
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

RequestApprovalHistorySchema.plugin(mongoosePaginate);
RequestApprovalHistorySchema.index({'$**': 'text'});
/*
GkClientSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = RequestApprovalHistorySchema;
