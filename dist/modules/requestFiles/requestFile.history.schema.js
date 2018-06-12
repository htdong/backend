// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
// SCHEMA
var RequestFileHistorySchema = new Schema({
    docId: String,
    username: String,
    // multi: Boolean,
    // tcode: String,
    diff: [],
    created_at: Date,
}, { collection: 'uploadFilesHistory' });
//IMPORTANT: Can not use arrow function here to ensure rebindable
RequestFileHistorySchema.pre('save', function (next) {
    let currentDate = new Date();
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});
RequestFileHistorySchema.plugin(mongoosePaginate);
RequestFileHistorySchema.index({ '$**': 'text' });
/*
GkClientSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = RequestFileHistorySchema;
