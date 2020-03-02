import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

const Account = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _roleId: { type: Schema.Types.ObjectId, ref: 'roles' },
  _supplierId: { type: String, lowercase: true, trim: true,
                 enum: ['supplier'] }, // supplier
  roleId: { type: String, lowercase: true, trim: true,
            enum: ['admin', 'sadmin'] },
  name: String,
  firstname: String,
  middlename: String,
  lastname: String,
  username: String,
  password: String,
  email: { type: String, index: { unique: true } },
  phone: String,
  address: String,
  gender: String,
  passport: String,
  country: String,
  state: String,
  lga: String,
  token: String,
  moveDate: Date,
  rightToDeleteAdmin: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  enterProduct: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

Account.plugin(passportLocalMongoose);

export default mongoose.model('accounts', Account);
