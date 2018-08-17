import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Promo = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _productId: { type: Schema.Types.ObjectId, ref: 'products' },
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  pieces: Number,
  oldPrice: Number,
  newPrice: Number,
  startDate: Date,
  endDate: Date,
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('promos', Promo);
