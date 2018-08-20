var express = require('express');
import Branch from '../../models/branch';
import Product from '../../models/product';
import Sales from '../../models/sales';
var verifyToken = require('../../helpers/verifyToken');
var multer = require('multer');
var path = require('path');
var imageName;
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function(req, file, cb) {
    imageName = Date.now() + path.extname(file.originalname);
    cb(null, imageName); // Appending extension
  }
});

var upload = multer({ storage: storage });

const router = express.Router();


router.get('/', verifyToken, async (req, res) => {
  const productCount = await Product.find({ _storeId: req.user._storeId }).count();
  const salesCount = await Sales.find({ _storeId: req.user._storeId }).count();
  const branchCount = await Branch.find({ _storeId: req.user._storeId }).count();
  // const todaysSupply = await Branch.find({ _storeId: req.user._storeId }).count();
  const branchSales = await Branch.find({ _branchId: req.user._branchId }).count();

  // const productsSold = await Sales.find({ _branchId: req.user._branchId }).count();
  //  const  = await Br
  const todaysDate = new Date().toISOString().split('T')[0];

  const todaySales = await Sales.find({
    $and: [
      { $and: [{ _storeId: req.user._storeId }, { _branchId: req.user._branchId }] },
      { $and: [{ createdAt: { $gt: new Date(todaysDate) } } ] }
    ]
  }).count();

  const sumVal = await Sales.aggregate([
    { $match: { createdAt: { $gt: new Date(todaysDate) } } },
    {
      $project: {
        totalPrice: { $sum: '$totalPrice' },
        pieces: { $sum: '$piecesSold' },
        numberOfProduct: { $size: '$_productId' },
        balance: { $sum: '$balanceTransaction' }
        // examTotal: { $sum: [ "$final", "$midterm" ] }
      }
    }
  ]);

  let totalPrice = 0;
  let totalProduct = 0;
  let totalPieces = 0;
  let totalBalance = 0;
  for (let i = 0; i < sumVal.length; i++) {
    totalPrice += sumVal[i].totalPrice;
    totalProduct += sumVal[i].numberOfProduct;
    totalPieces += sumVal[i].numberOfProduct;
    totalBalance += sumVal[i].balance;
  }
  const totals = {
    totalPrice: totalPrice,
    totalProduct: totalProduct,
    totalPieces: totalPieces,
    totalBalance: totalBalance,
  };

  const countDetails = {
    productCount: productCount,
    salesCount: salesCount,
    branchCount: branchCount,
    branchSales: branchSales,
    todaySales: todaySales,
    salesDetails: totals
  };

  console.log(sumVal);

  return res.json({ countDetails: countDetails });
});

router.get('/todaysData', verifyToken, async (req, res) => {
  const todaysDate = new Date().toISOString().split('T')[0];
  const todaySales = await Sales.find({
    $and: [
      { $and: [{ _storeId: req.user._storeId }, { _branchId: req.user._branchId }] },
      { $and: [{ createdAt: { $gt: new Date(todaysDate) } } ] }
    ]
  }).populate('_productId').populate('_branchId').populate('_salesBy').populate('_customerId').sort({"createdAt":-1});

  console.log(todaySales);
 return res.json({ saleDetails: todaySales });
});
module.exports = router;
// export default router;
