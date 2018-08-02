import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const branchProduct = new Schema({
    _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
    _productId: { type: Schema.Types.ObjectId, ref: 'products' },
    _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
    _movedBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
    pieces: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  });

export default mongoose.model('branchproducts', branchProduct);
