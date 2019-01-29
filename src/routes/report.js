import express from 'express';
import Account from '../models/account';
import Branch from '../models/branch';
import Sales from '../models/sales';
import guard from 'connect-ensure-login';
import BranchProduct from '../models/branchProduct';
import ProductUpdateHistory from '../models/productUpdateHistory';

const router = express.Router();


router.get('/', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId').populate('_branchId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  res.render('report/sales', { user, branches, layout: 'layouts/user' });
});


router.post('/get/sales', guard.ensureLoggedIn(), async (req, res) => {

  const { branchId, dateBet, dateTill } = req.body;


  const bet1 = new Date(dateBet);
  bet1.setDate(bet1.getDate() + 1);
  const betResult = new Date(bet1).toISOString().split('T')[0];


  let tillResult;
  if (dateTill !== '') {

    const till1 = new Date(dateTill);
    till1.setDate(till1.getDate() + 2);
    tillResult = new Date(till1).toISOString().split('T')[0];

  } else {

    const till1 = new Date(betResult);
    till1.setDate(till1.getDate() + 1);
    tillResult = new Date(till1).toISOString().split('T')[0];
  }


  const sales = await Sales.find({ _storeId: req.user._storeId, _branchId: branchId, createdAt: { $gte: betResult, $lte: tillResult } })
                            .populate('_productId').populate('_branchId')
                            .populate('_salesBy').populate('_customerId');

  return res.json(sales);
});


router.get('/product', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId').populate('_branchId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  res.render('report/product', { user, branches, layout: 'layouts/user' });
});


router.post('/get/product', guard.ensureLoggedIn(), async (req, res) => {


  const { branchId, dateBet, dateTill } = req.body;

  const bet1 = new Date(dateBet);
  bet1.setDate(bet1.getDate() + 1);
  const betResult = new Date(bet1).toISOString().split('T')[0];

  console.log(betResult);


  let tillResult;
  if (dateTill !== '') {

    const till1 = new Date(dateTill);
    till1.setDate(till1.getDate() + 2);
    tillResult = new Date(till1).toISOString().split('T')[0];

  } else {

    const till1 = new Date(betResult);
    till1.setDate(till1.getDate() + 1);
    tillResult = new Date(till1).toISOString().split('T')[0];
  }

  console.log(tillResult);

  const branchproduct = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: branchId, createdAt: { $gte: betResult, $lt: tillResult } })
                          .populate({
                            path: '_productId',
                            populate: { path: '_categoryId' }
                          }).populate('_branchId')
                          .populate('_movedBy');

  console.log(branchproduct);
  return res.json(branchproduct);
});


router.get('/product/update', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId').populate('_branchId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  res.render('report/productupdate', { user, branches, layout: 'layouts/user' });
});


router.post('/get/product/update', guard.ensureLoggedIn(), async (req, res) => {

  const { branchId, dateBet, dateTill } = req.body;

  const bet1 = new Date(dateBet);
  bet1.setDate(bet1.getDate() + 1);
  const betResult = new Date(bet1).toISOString().split('T')[0];

  console.log(betResult);


  let tillResult;
  if (dateTill !== '') {

    const till1 = new Date(dateTill);
    till1.setDate(till1.getDate() + 2);
    tillResult = new Date(till1).toISOString().split('T')[0];

  } else {

    const till1 = new Date(betResult);
    till1.setDate(till1.getDate() + 1);
    tillResult = new Date(till1).toISOString().split('T')[0];
  }

  console.log(tillResult);

  const productUpdateHistory = await ProductUpdateHistory.find({ _storeId: req.user._storeId, _branchId: branchId, createdAt: { $gte: betResult, $lt: tillResult } })
                          .populate({
                            path: '_productId',
                            populate: { path: '_categoryId' }
                          }).populate('_branchId')
                          .populate('_updatedBy');

  console.log(productUpdateHistory);
  return res.json(productUpdateHistory);
});


router.get('/account', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId').populate('_branchId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  res.render('report/account', { user, branches, layout: 'layouts/user' });
});



router.post('/get/account', guard.ensureLoggedIn(), async (req, res) => {


  const { branchId, dateBet, dateTill } = req.body;

  const bet1 = new Date(dateBet);
  bet1.setDate(bet1.getDate() + 1);
  const betResult = new Date(bet1).toISOString().split('T')[0];

  console.log(betResult);


  let tillResult;
  if (dateTill !== '') {

    const till1 = new Date(dateTill);
    till1.setDate(till1.getDate() + 2);
    tillResult = new Date(till1).toISOString().split('T')[0];

  } else {

    const till1 = new Date(betResult);
    till1.setDate(till1.getDate() + 1);
    tillResult = new Date(till1).toISOString().split('T')[0];
  }

  console.log(tillResult);

  const sales = await Sales.find({ _storeId: req.user._storeId, _branchId: branchId, createdAt: { $gte: betResult, $lte: tillResult } })
                            .populate('_productId').populate('_branchId')
                            .populate('_salesBy').populate('_customerId');

  return res.json(sales);
});

export default router;
