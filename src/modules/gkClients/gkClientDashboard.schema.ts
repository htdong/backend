// External
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;

// Schema
var GkClientDashboardSchema = new Schema ({
  name: {
    type: String,
    required: true,
    minlength: 5
  },
  remarks: [],
  status1: { type: String },
  status2: { type: String },
  created_at: Date,
  updated_at: Date,
}, { collection: 'clients_dashboard' });

//IMPORTANT: Can not use arrow function here to ensure rebindable
GkClientDashboardSchema.pre('save', function (next) {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

GkClientDashboardSchema.plugin(mongoosePaginate);
GkClientDashboardSchema.index({'$**': 'text'});
/*
GkClientSchema.index({
  name: 'text',
  db: 'text',
  status1: 'text',
  status2: 'text'
});
*/
module.exports = GkClientDashboardSchema;
