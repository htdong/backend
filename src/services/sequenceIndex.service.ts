// External
import express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global. Promise;
var Schema = mongoose.Schema;

// Internal
var ConstantsBase = require('../config/base/constants.base');

var simpleHash = require('../../services/simpleHash.service');
// import  { SimpleHash } from './simpleHash.service';

// Schema
var CounterSchema = new Schema ({
  _id: { type: String, required: true, unique: true },
  seq: { type: Number, required: true },
  status: { type: String },
  created_at: Date,
  updated_at: Date,
}, { collection: 'counters' });

CounterSchema.pre('save', (next) => {
  let currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

export class SequenceIndex {
  db;
  counterName;

  constructor (
    db: any,
    counterName: string,
  ) {
    this.counterName = counterName;
    this.db = db;
  }

  public getNextSequence() {

    var criteria = { _id: this.counterName };
    var sort =  {$natural: 1};
    var update =  { $inc: { seq: 1 } };
    var options = {
      remove: false,
      new: true,
      upsert: true
    };

    var Counter = this.db.model('counters', CounterSchema);
    return Counter.findAndModify(criteria, sort, update, options);
  }

}
