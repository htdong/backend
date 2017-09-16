// External
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Schema
var GkClientSchema = new Schema ({
  initial: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  addresses: [],
  contacts: [],
  clientDb: { type: String, required: true },
  remarks: [],
  status: { type: String },
  created_at: Date,
  updated_at: Date,
}, { collection: 'clients' });

GkClientSchema.pre('save', (next) => {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

module.exports = GkClientSchema;
