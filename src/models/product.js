import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Product = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _supplierId: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _categoryId: { type: Schema.Types.ObjectId, ref: 'categories' },
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  name: String,
  pieces: Number,
  price: Number,
  expireDate: String,
  note: String,
  barcodeNumber: Number,
  productImage: String,
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('products', Product);
