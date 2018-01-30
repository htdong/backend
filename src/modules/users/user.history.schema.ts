// External
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// Schema
var UserHistorySchema = new Schema ({
  docId: String,
  username: String,  
  multi: Boolean,
  tcode: String,  
  diff: [], 
  created_at: Date,
}, { collection: 'clientsHistory' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
UserHistorySchema.pre('save', function (next) {
  let currentDate = new Date();
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

UserHistorySchema.plugin(mongoosePaginate);
UserHistorySchema.index({'$**': 'text'});

module.exports = UserHistorySchema;
