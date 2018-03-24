// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// SCHEMA
var GkRequestHistorySchema = new Schema ({
  docId: String,
  username: String,  
  multi: Boolean,
  tcode: String,  
  diff: [], 
  created_at: Date,
}, { collection: 'requestsHistory' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
GkRequestHistorySchema.pre('save', function (next) {
  let currentDate = new Date();
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

GkRequestHistorySchema.plugin(mongoosePaginate);
GkRequestHistorySchema.index({'$**': 'text'});
/*
GkRequestSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = GkRequestHistorySchema;
