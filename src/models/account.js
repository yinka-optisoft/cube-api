import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

const Account = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  firstname: String,
  middlename: String,
  lastname: String,
  username: String,
  password: String,
  // _role: { type: Schema.Types.ObjectId, ref: 'staffroles' },
  // TODO: this need to be change back to dynamic staff rle
  role: { type: String, lowercase: true, trim: true,
    enum: ['admin', 'staff'] },
  email: String,
  phone: Number,
  address: String,
  passport: String,
  status: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

Account.plugin(passportLocalMongoose);

export default mongoose.model('accounts', Account);
