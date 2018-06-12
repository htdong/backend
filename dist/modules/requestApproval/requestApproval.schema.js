// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
// SCHEMA
var RequestApprovalSchema = new Schema({
    desc: {
        type: String,
        required: true,
    },
    items: [],
    tcode: {
        type: String,
        required: true,
        minlength: 3
    },
    status1: { type: String },
    status2: { type: String },
    created_at: Date,
    updated_at: Date,
}, { collection: 'requestApproval' });
//IMPORTANT: Can not use arrow function here to ensure rebindable
RequestApprovalSchema.pre('save', function (next) {
    let currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});
RequestApprovalSchema.plugin(mongoosePaginate);
RequestApprovalSchema.index({ '$**': 'text' });
/*
GkRequestSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = RequestApprovalSchema;
