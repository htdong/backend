// External
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// Schema
var NotificationSchema = new Schema ({
  tcode: String,
  id: String,
  icon: String,
  desc: String,
  url: String,
  data: {},
  username: String,
  creator: String,
  isMark: Boolean,
  created_at: Date,
}, { collection: 'notification' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
NotificationSchema.pre('save', function (next) {
  let currentDate = new Date();
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

NotificationSchema.plugin(mongoosePaginate);
NotificationSchema.index({'$**': 'text'});

module.exports = NotificationSchema;
