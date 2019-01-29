import mongoose from 'mongoose';
const Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const Sale = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _productId: [{ type: Schema.Types.ObjectId, ref: 'products' }],
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _salesBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _customerId: { type: Schema.Types.ObjectId, ref: 'customers' },
  invoiceDate: Date,
  customerName: String,
  customerPhone: String,
  invoiceNumber: String,
  waybillNumber: String,
  amountDue: Number,
  amountPaid: Number,
  balanceTransaction: Number,
  discount: Number,
  piecesSold: [Number],
  unitPrice: [Number],
  subtotal: [Number],
  totalPrice: [Number],
  offlineId: String,
  paidBy: { type: String, lowercase: true, trim: true,
            enum: ['cash', 'pos', 'transfer'] },
  createdAt: { type: Date, default: Date.now }
});

Sale.plugin(mongoosePaginate);
export default mongoose.model('sales', Sale);

