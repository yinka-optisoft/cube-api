import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Bussiness = new Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('bussinesses', Bussiness);
