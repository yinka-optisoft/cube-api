import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Branch = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  name: String,
  email: String,
  phone: Number,
  address: String,
  country: String,
  state: String,
  city: String,
  headBranch: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('branches', Branch);
