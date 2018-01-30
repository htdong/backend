// External
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// Schema
var GkClientHistorySchema = new Schema ({
  docId: String,
  username: String,  
  multi: Boolean,
  tcode: String,  
  diff: [], 
  created_at: Date,
}, { collection: 'clientsHistory' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
GkClientHistorySchema.pre('save', function (next) {
  let currentDate = new Date();
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

GkClientHistorySchema.plugin(mongoosePaginate);
GkClientHistorySchema.index({'$**': 'text'});
/*
GkClientSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = GkClientHistorySchema;
