// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
// SCHEMA
var DeptHistorySchema = new Schema({
    docId: String,
    username: String,
    multi: Boolean,
    tcode: String,
    diff: [],
    created_at: Date,
}, { collection: 'depts' });
//IMPORTANT: Can not use arrow function here to ensure rebindable
DeptHistorySchema.pre('save', function (next) {
    let currentDate = new Date();
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});
DeptHistorySchema.plugin(mongoosePaginate);
DeptHistorySchema.index({ '$**': 'text' });
module.exports = DeptHistorySchema;
