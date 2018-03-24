/**
*
*/

// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// SCHEMA
var DashboardPageSchema = new Schema ({
  module: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  creator: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  content: [],
  remark: [],
  status1: { type: String },
  status2: { type: String },
  created_at: Date,
  updated_at: Date,
}, { collection: 'dashboard_items' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
DashboardPageSchema.pre('save', function (next) {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

DashboardPageSchema.plugin(mongoosePaginate);
DashboardPageSchema.index({'$**': 'text'});

module.exports = DashboardPageSchema;
