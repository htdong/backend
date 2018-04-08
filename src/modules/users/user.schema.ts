// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// SCHEMA
var UserSchema = new Schema ({
  firstname: { type: String, required: true},
  lastname: { type: String, required: true},
  fullname: { type: String },
  username: { type: String, required: true, unique: true},
  title: { type: String },
  avatar: { type: String },
  email: { type: String, required: true, unique: true},
  hash: { type: String, required: true },
  tcodes: [],
  defaultLge: { type: String },
  lges: [],
  status: { type: String },
  created_at: Date,
  updated_at: Date,
  status1: { type: String, default: 'Active' },
  status2: { type: String, default: 'Unmarked' },
}, { collection: 'users' });

// Can not query directly but can call case by case
UserSchema.virtual('fullname1').get(function () {
  return this.firstname + ' ' + this.lastname;
});

UserSchema.pre('save', (next) => {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

UserSchema.plugin(mongoosePaginate);
UserSchema.index({'$**': 'text'});

module.exports = UserSchema;
