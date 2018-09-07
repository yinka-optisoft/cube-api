import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const license = new Schema({
  _packageId: { type: Schema.Types.ObjectId, ref: 'packages' },
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _usedBy: { type: Schema.Types.ObjectId, ref: 'stores' },
  key: String,
  status: String,
  usedDate: Date,
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('licenses', license);
