// EXTERNAL
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// SCHEMA
var SessionSchema = new Schema({
    username: { type: String },
    fullname: { type: String },
    avatar: { type: String },
    clientId: { type: String },
    clientDb: { type: String },
    wklge: { type: String },
    wkyear: { type: String },
    directmanager: {},
    department: {},
    tcodes: [],
    setting: {
        maxUploadSize: Number
    }
});
module.exports = SessionSchema;
