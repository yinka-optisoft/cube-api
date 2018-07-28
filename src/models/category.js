import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Category = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  name: String,
  discription: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('categories', Category);
