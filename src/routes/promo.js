import express from 'express';
import Store from '../models/store';
import Account from '../models/account';
import Branch from '../models/branch';
import Category from '../models/category';
import Product from '../models/product';
import BranchProduct from '../models/branchProduct';
import guard from 'connect-ensure-login';
import Promo from '../models/promo';
const router = express.Router();


router.get('/', async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  const promos = await Promo.find({ _storeId: req.user._storeId })
                            .populate('_branchId').populate('_createdBy')
                            .populate({
                              path: '_productId',
                              populate: { path: '_categoryId' }
                            });
  console.log(promos);
  res.render('promo/manage', { user, branches, promos, msg: req.flash('info'), layout: 'layouts/user' });
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

  console.log(req.body);

  const exPromo = await Promo.findOne({ _storeId: req.user._storeId, _branchId: req.body.fromId, _productId: req.body.productId });

  if (exPromo) {

    const product = await BranchProduct.findOne({ _storeId: req.user._storeId, _branchId: req.body.fromId, _productId: req.body.productId });

    exPromo._storeId = req.user._storeId;
    exPromo._branchId = req.user._branchId;
    exPromo._productId = req.body.productId;
    exPromo._createdBy = req.user._id;
    exPromo.pieces += (parseFloat(req.body.pieces));
    exPromo.oldPrice = req.body.price;
    exPromo.newPrice = req.body.newPrice;
    exPromo.startDate = req.body.startDate;
    exPromo.endDate = req.body.endDate;
    exPromo.save((err) => {
      if (err) {
        console.log(err);
      }
    });


    product.pieces -= parseFloat(req.body.pieces);
    await product.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('info', 'Promo Product Set');
        res.redirect('/promo');
      }
    });

  } else {

    const product = await BranchProduct.findOne({ _storeId: req.user._storeId, _branchId: req.body.fromId, _productId: req.body.productId });

    const newPromo = new Promo();
    newPromo._storeId = req.user._storeId;
    newPromo._branchId = req.user._branchId;
    newPromo._productId = req.body.productId;
    newPromo._createdBy = req.user._id;
    newPromo.pieces = req.body.pieces;
    newPromo.oldPrice = req.body.price;
    newPromo.newPrice = req.body.newPrice;
    newPromo.startDate = req.body.startDate;
    newPromo.endDate = req.body.endDate;
    newPromo.save((err) => {
      if (err) {
        console.log(err);
      }
    });

    product.pieces -= parseFloat(req.body.pieces);
    await product.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('info', 'Promo Product Set');
        res.redirect('/promo');
      }
    });
  }
});


export default router;
