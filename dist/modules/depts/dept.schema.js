// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
// SCHEMA
var DeptSchema = new Schema({
    desc: {
        type: String,
        required: true
    },
    creator: {},
    status1: { type: String },
    status2: { type: String },
    created_at: Date,
    updated_at: Date,
}, { collection: 'depts' });
//IMPORTANT: Can not use arrow function here to ensure rebindable
DeptSchema.pre('save', function (next) {
    let currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});
DeptSchema.plugin(mongoosePaginate);
DeptSchema.index({ '$**': 'text' });
/*
DeptSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = DeptSchema;
