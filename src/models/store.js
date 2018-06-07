import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Store = new Schema({
  name: String,
  phone: Number,
  email: String,
  shortCode: String,
  website: String,
  businessType: { type: String, lowercase: true, trim: true,
                  enum: ['manufacturing', 'retail', 'retails_and_wholesale'] },
  country: String,
  state: String,
  city: String,
  logo: String,
  status: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('stores', Store);
