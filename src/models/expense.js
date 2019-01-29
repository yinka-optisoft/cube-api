import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Expense = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  category: String,
  amount: Number,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('expense', Expense);
