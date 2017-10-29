// External
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// Schema
var GkClientHistorySchema = new Schema ({
  username: String,
  tcode: String,  
  old: {},
  diff: [], 
  created_at: Date,
}, { collection: 'clientsHistory' });

GkClientHistorySchema.pre('save', (next) => {
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
