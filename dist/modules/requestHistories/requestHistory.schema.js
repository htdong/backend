// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
// SCHEMA
var RequestHistorySchema = new Schema({
    docId: {
        type: String,
        require: true
    },
    type: {
        type: String,
        required: true
    },
    header: {
        type: String,
        required: true
    },
    body: String,
    footer: String,
    created_at: Date
}, { collection: 'requests_histories' });
//IMPORTANT: Can not use arrow function here to ensure rebindable
RequestHistorySchema.pre('save', function (next) {
    let currentDate = new Date();
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});
RequestHistorySchema.plugin(mongoosePaginate);
RequestHistorySchema.index({ '$**': 'text' });
/*
GkClientSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = RequestHistorySchema;
