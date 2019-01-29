import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ProductUpdateHistory = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _updatedBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _productId: { type: Schema.Types.ObjectId, ref: 'products' },
  oldPieces: Number,
  newPieces: Number,
  totalPieces: Number,
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model('ProductUpdateHistories', ProductUpdateHistory);
