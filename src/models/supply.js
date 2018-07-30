import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Supply = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  name: String,
  pieces: Number,
  price: Number,
  expireDate: String,
  note: String,
  moveDate: { type: Date, default: Date.now },
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('supplies', Supply);
