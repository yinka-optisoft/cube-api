import express from 'express';
import Store from '../models/store';
import Role from '../models/role';
import Account from '../models/account';
import Branch from '../models/branch';
import Sales from '../models/sales';
import Product from '../models/product';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import BranchProduct from '../models/branchProduct';

const router = express.Router();


router.get('/', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId').populate('_branchId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  res.render('report/sales', { user, branches, layout: 'layouts/user' });
});


router.post('/get/sales', guard.ensureLoggedIn(), async (req, res) => {

  console.log(req.body);

  const { branchId, dateBet, dateTill } = req.body;

  if (dateBet !== '' && dateTill !== '') {

    const bet1 = new Date(dateBet).toISOString();
    const till1 = new Date(dateTill).toISOString();

    console.log(bet1);
    console.log(till1);


    const sales = await Sales.find({ _storeId: req.user._storeId, _branchId: branchId, createdAt: { $gte: bet1, $lte: till1 } })
                              .populate('_productId').populate('_branchId')
                              .populate('_salesBy').populate('_customerId');

    return res.json(sales);

  } else {

    const sales = await Sales.find({ _storeId: req.user._storeId, _branchId: branchId })
                              .populate('_productId').populate('_branchId')
                              .populate('_salesBy').populate('_customerId');

    return res.json(sales);
  }
});


router.get('/product', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId').populate('_branchId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  res.render('report/product', { user, branches, layout: 'layouts/user' });
});


router.post('/get/product', guard.ensureLoggedIn(), async (req, res) => {

  console.log(req.body);

  const { branchId, dateBet, dateTill } = req.body;

  if (dateBet !== '' && dateTill !== '') {

    const bet1 = new Date(dateBet).toISOString();
    const till1 = new Date(dateTill).toISOString();

    console.log(bet1);
    console.log(till1);

    const branchproduct = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: branchId, createdAt: { $gte: bet1, $lte: till1 } })
                            .populate({
                              path: '_productId',
                              populate: { path: '_categoryId' }
                            }).populate('_branchId')
                            .populate('_movedBy');

    return res.json(branchproduct);

  } else {

    const branchproduct = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: branchId })
                              .populate({
                                path: '_productId',
                                populate: { path: '_categoryId' }
                              }).populate('_branchId')
                              .populate('_movedBy');


    return res.json(branchproduct);
  }
});

export default router;
