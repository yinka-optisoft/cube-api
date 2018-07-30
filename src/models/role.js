import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Role = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  name: { type: String, lowercase: true, trim: true },
  roleType: { type: String, lowercase: true, trim: true,
    enum: ['store', 'branch'] }, // supplier
  discription: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('roles', Role);
