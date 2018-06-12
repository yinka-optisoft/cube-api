import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Store = new Schema({
  _businessId: { type: Schema.Types.ObjectId, ref: 'bussinesses' },
  name: { type: String, required: true },
  phone: Number,
  email: String,
  shortCode: String,
  website: String,
  address: { type: String, required: true },
  country: String,
  state: String,
  city: String,
  logo: String,
  status: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('stores', Store);
