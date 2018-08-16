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

  const productsSold = await Sales.find({ _branchId: req.user._branchId }).count();
  //  const  = await Br
  const countDetails = { productCount: productCount, salesCount: salesCount, branchCount: branchCount, branchSales: branchSales };

  console.log(countDetails);
  return res.json({ countDetails: countDetails });
});

router.post('/makeSales', verifyToken, async (req, res) => {

  //  const  = await Br
});
module.exports = router;
// export default router;
