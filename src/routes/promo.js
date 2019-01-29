import express from 'express';
import Account from '../models/account';
import Branch from '../models/branch';
import Product from '../models/product';
import BranchProduct from '../models/branchProduct';
import guard from 'connect-ensure-login';
import Promo from '../models/promo';
const router = express.Router();


router.get('/', async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branches = await Branch.find({ _storeId: req.user._storeId });

  const exPromo = await Product.find({ _storeId: req.user._storeId, promo: true })
                                .populate('_categoryId').populate('_createdBy')
                                .populate('_promoCreatedBy').populate('_promoCloseBy');
  res.render('promo/manage', { user, branches, exPromo, msg: req.flash('info'), layout: 'layouts/user' });
});


router.post('/get/product', guard.ensureLoggedIn(), async (req, res, next) => {
  const products = await BranchProduct.find({ _storeId: req.session._storeId, _branchId: req.body.branchId })
                                          .populate('_categoryId').populate('_productId');
  return res.json(products);
});


router.post('/get/pieces', guard.ensureLoggedIn(), async (req, res, next) => {

  const product = await BranchProduct.findOne({ _productId: req.body._productId, _branchId: req.body.branchId })
                                    .populate('_categoryId').populate('_productId');
  return res.json(product);
});


router.post('/', guard.ensureLoggedIn(), async (req, res, next) => {

  const exPromo = await Product.findOne({ _storeId: req.user._storeId, _id: req.body.productId });

  if (exPromo) {

    exPromo._storeId = req.user._storeId;
    exPromo._promoCreatedBy = req.user._id;
    exPromo.promoPieces = req.body.pieces;
    exPromo.oldPrice = req.body.price;
    exPromo.sellingPrice = req.body.newPrice;
    exPromo.startDate = req.body.startDate;
    exPromo.endDate = req.body.endDate;
    exPromo.promo = true;
    exPromo.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('info', 'Promo Product Set');
        res.redirect('/promo');
      }
    });
  }
});


router.post('/disable/promo', guard.ensureLoggedIn(), async (req, res, next) => {

  const exPromo = await Product.findOne({ _storeId: req.user._storeId, _id: req.body.id });

  if (exPromo) {

    exPromo._storeId = req.user._storeId;
    exPromo._promoCloseBy = req.user._id;
    exPromo.promo = false;
    exPromo.sellingPrice = exPromo.oldPrice;
    exPromo.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.send('success');
      }
    });
  }
});


export default router;
