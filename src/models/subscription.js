import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Subscription = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _packageId: { type: Schema.Types.ObjectId, ref: 'packages' },
  _licenseId: { type: Schema.Types.ObjectId, ref: 'licenses' },
  _entryBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  activateDate: Date,
  expiredDate: Date,
  expired: Boolean,
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('subscriptions', Subscription);
