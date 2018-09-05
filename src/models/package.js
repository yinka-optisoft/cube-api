import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Package = new Schema({
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  category: String,
  period: String,
  price: Number,
  numberOfUser: Number,
  numberOfAdmin: Number,
  monthlyDuration: Number,
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Packages', Package);
