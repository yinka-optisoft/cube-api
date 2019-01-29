import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Customer = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  name: String,
  email: String,
  phone: Number,
  address: String,
  show: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('customers', Customer);
