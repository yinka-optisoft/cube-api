import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Product = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _categoryId: { type: Schema.Types.ObjectId, ref: 'categories' },
  _fromId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _toId: { type: Schema.Types.ObjectId, ref: 'branches' },
  name: String,
  pieces: Number,
  price: Number,
  expireDate: String,
  note: String,
  moveDate: { type: Date, default: Date.now },
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('products', Product);
