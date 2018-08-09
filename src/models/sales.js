import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Sale = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _productId: [{ type: Schema.Types.ObjectId, ref: 'products' }],
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _salesBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _customerId: { type: Schema.Types.ObjectId, ref: 'accounts' },
  invoiceDate: Date,
  invoiceNumber: String,
  waybillNumber: String,
  amountDue: Number,
  amountPaid: Number,
  balanceTransaction: Number,
  discount: Number,
  piecesSold: [Number],
  unitPrice: [Number],
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('sales', Sale);
