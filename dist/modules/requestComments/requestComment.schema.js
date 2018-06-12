// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
// SCHEMA
var RequestCommentSchema = new Schema({
    docId: {
        type: String,
        require: true
    },
    username: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true,
    },
    created_at: Date
}, { collection: 'requests_comments' });
//IMPORTANT: Can not use arrow function here to ensure rebindable
RequestCommentSchema.pre('save', function (next) {
    let currentDate = new Date();
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});
RequestCommentSchema.plugin(mongoosePaginate);
RequestCommentSchema.index({ '$**': 'text' });
/*
GkClientSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = RequestCommentSchema;
