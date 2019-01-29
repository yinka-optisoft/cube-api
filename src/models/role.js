import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Role = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _accountId: { type: Schema.Types.ObjectId, ref: 'accounts' },
  name: { type: String, lowercase: true, trim: true },
  roleType: { type: String, enum: ['Store', 'Branch'] },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('roles', Role);
