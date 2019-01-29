import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Category = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  name: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  _userId: { type: Schema.Types.ObjectId, ref: 'accounts' },
});

export default mongoose.model('categories', Category);
