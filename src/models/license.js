import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const license = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _packageId: { type: Schema.Types.ObjectId, ref: 'packages' },
  invoiceDate: Date,
  invoiceNumber: String,
  waybillNumber: String,
  amountDue: Number,
  amountPaid: Number,
  balanceTransaction: Number,
  discount: Number,
  piecesSold: [Number],
  unitPrice: [Number],
  totalPrice: [Number],
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('licenses', license);
