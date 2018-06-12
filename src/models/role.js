import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Role = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  name: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('roles', Role);
