import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Invoice = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _productId: { type: Schema.Types.ObjectId, ref: 'products' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _salesBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _customerId: { type: Schema.Types.ObjectId, ref: 'accounts' },
  salesDate: Date,
  invoiceDate: Date,
  invoiceNumber: Number,
  waybillNumber: Number,
  piecesSold: Number,
  productPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('invoices', Invoice);
