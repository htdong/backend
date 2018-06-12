// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
// SCHEMA
var GkClientRequestSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5
    },
    addresses: [],
    contacts: [],
    clientDb: {
        type: String,
        required: true,
        unique: true
    },
    remarks: [],
    solutions: [
        {
            type: String,
            ref: 'solutions'
        }
    ],
    status1: { type: String },
    status2: { type: String },
    created_at: Date,
    updated_at: Date,
}, { collection: 'client_requests' });
//IMPORTANT: Can not use arrow function here to ensure rebindable
GkClientRequestSchema.pre('save', function (next) {
    let currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});
GkClientRequestSchema.plugin(mongoosePaginate);
GkClientRequestSchema.index({ '$**': 'text' });
module.exports = GkClientRequestSchema;
