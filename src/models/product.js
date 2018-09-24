import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Product = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _supplierId: { type: Schema.Types.ObjectId, ref: 'supplies' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _categoryId: { type: Schema.Types.ObjectId, ref: 'categories' },
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _updatedBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  productName: String,
  pieces: Number,
  sellingPrice: Number,
  expiryDate: String,
  note: String,
  reorderLevel: String,
  productImage: String,
  barcodeNumber: String,
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  _promoCreatedBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _promoCloseBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  promo: { type: Boolean, default: false },
  oldPrice: Number,
  startDate: Date,
  endDate: Date,
  lastUpdatedDate: Date,
  promoPieces: Number,
});

export default mongoose.model('products', Product);
