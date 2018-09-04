import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Package = new Schema({
  name: String,
  price: Number,
  numberOfUser: Number,
  monthlyDuration: Number,
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Packages', Package);
