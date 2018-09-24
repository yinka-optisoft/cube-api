import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Supply = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  firstname: String,
  middlename: String,
  lastname: String,
  //email: { type: String, index: { unique: true } },
  email: { type: String },
  phone: Number,
  address: String,
  show: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('supplies', Supply);
