import mongoose from 'mongoose';
var mongoosePaginate = require('mongoose-paginate');
import mongoosastic from 'mongoosastic';
const Schema = mongoose.Schema;

const Product = new Schema({
  _storeId: { type: Schema.Types.ObjectId, ref: 'stores' },
  _supplierId: { type: Schema.Types.ObjectId, ref: 'supplies' },
  _branchId: { type: Schema.Types.ObjectId, ref: 'branches' },
  _categoryId: { type: Schema.Types.ObjectId, ref: 'categories' },
  _createdBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _updatedBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  productName: { type: String, es_indexed: true },
  pieces: Number,
  sellingPrice: Number,
  expiryDate: String,
  note: String,
  reorderLevel: String,
  productImage: String,
  barcodeNumber: String,
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  _promoCreatedBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  _promoCloseBy: { type: Schema.Types.ObjectId, ref: 'accounts' },
  promo: { type: Boolean, default: false },
  oldPrice: Number,
  startDate: Date,
  endDate: Date,
  lastUpdatedDate: Date,
  promoPieces: Number,
});
Product.plugin(mongoosePaginate);
// var esClient = new elasticsearch.Client({ host: 'localhost:9200' });
// Product.plugin(mongoosastic, {  esClient: esClient });
Product.plugin(mongoosastic, { hosts: ['127.0.0.1:9200'], bulk: { size: 2800, delay: 100 } });
export default mongoose.model('products', Product);
