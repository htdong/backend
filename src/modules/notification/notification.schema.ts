// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// SCHEMA
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
  expireAt: Date
}, { collection: 'notification' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
NotificationSchema.pre('save', function (next) {
  if (!this.created_at) {
    this.created_at = new Date();
    let currentDate = new Date();
    this.expireAt = currentDate.setMonth(currentDate.getMonth() + 3);
  }
  next();
});

NotificationSchema.plugin(mongoosePaginate);
NotificationSchema.index({'$**': 'text'});

module.exports = NotificationSchema;
