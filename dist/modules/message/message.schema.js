// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
// SCHEMA
var MessageSchema = new Schema({
    desc: String,
    msg: String,
    username: String,
    creator: String,
    isMark: Boolean,
    created_at: Date,
}, { collection: 'message' });
//IMPORTANT: Can not use arrow function here to ensure rebindable
MessageSchema.pre('save', function (next) {
    let currentDate = new Date();
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});
MessageSchema.plugin(mongoosePaginate);
MessageSchema.index({ '$**': 'text' });
module.exports = MessageSchema;
