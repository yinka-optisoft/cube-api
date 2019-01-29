import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productTransfer = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _productId: { type: Schema.Types.ObjectId, ref: 'products' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _fromId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _toId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _branchProduct: { type: Schema.Types.ObjectId, ref: 'branchproducts' },
  _movedBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  pieces: Number,
  totalPieces: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('productstransfers', productTransfer);
