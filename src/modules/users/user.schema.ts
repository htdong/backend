// EXTERNAL
import * as crypto from 'crypto';
import * as mongoose  from 'mongoose';
import * as mongoosePaginate  from 'mongoose-paginate';
const Schema = mongoose.Schema;

// SCHEMA
const UserSchema = new Schema ({
  email: { type: String, required: true, unique: true},

  hash: { type: String, required: true },
  resetHash: { type: String },
  resetHashExpiry: { type: Date },

  avatar: { type: String },
  name: {type: String},

  firstname: {type: String, default: ''},
  lastname: {type: String, default: ''},
  line1: {type: String},
  line2: {type: String},
  city: {type: String},
  postcode: {type: String},
  country: {type: String},
  bio: {type: String},

  alt_email: {type: String},
  phone: {type: String},
  alt_phone: {type: String},
  ism: {type: String},
  alt_ism: {type: String},
  contact: {type: String},

  tcodes: [],

  title: { type: String },
  position: {type: String},

  doa: Number,
  dov: Number,

  directmanager: { type: Schema.Types.ObjectId},
  department: {},

  defaultLge: { type: String },
  lges: [],

  status1: { type: String, default: 'Active' },
  status2: { type: String, default: 'Unmarked' },

}, { timestamps: true, collection: 'users' });

// Can not query directly but can call case by case
// UserSchema.virtual('fullname').get(function () {
//   return this.firstname + ' ' + this.lastname;
// });

UserSchema.pre('save', (next) => {
  const user = this;

  if (user.firstname && user.lastname) {
    user.name = user.firstname + ', ' + user.lastname;
  } else {
    if (user.firstname) { user.name = user.firstname; }
    if (user.lastname) { user.name = user.lastname; }
  }

  next();
});

/**
 * Helper method for getting user's gravatar.
 */
UserSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

UserSchema.plugin(mongoosePaginate);

UserSchema.index({'$**': 'text'});

module.exports = UserSchema;
