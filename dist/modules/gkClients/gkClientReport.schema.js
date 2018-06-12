// EXTERNAL
var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
// SCHEMA
var GkClientReportSchema = new Schema({
    report: String,
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
}, { collection: 'clients_reports' });
//IMPORTANT: Can not use arrow function here to ensure rebindable
GkClientReportSchema.pre('save', function (next) {
    let currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});
GkClientReportSchema.plugin(mongoosePaginate);
GkClientReportSchema.index({ '$**': 'text' });
module.exports = GkClientReportSchema;
