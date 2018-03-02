// External
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// Schema
var DashboardItemSchema = new Schema ({
  module: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  grid: {
    type: String,
    required: true
  },
  component: {
    type: String,
    required: true
  },
  params: {
    dimensions: [],
    measures: []
  },
  inputs: {},
  outputs: {},
  status1: { type: String },
  status2: { type: String },
  created_at: Date,
  updated_at: Date,
}, { collection: 'dashboard_items' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
DashboardItemSchema.pre('save', function (next) {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

DashboardItemSchema.plugin(mongoosePaginate);
DashboardItemSchema.index({'$**': 'text'});

module.exports = DashboardItemSchema;
