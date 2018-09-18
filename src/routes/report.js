import express from 'express';
import Account from '../models/account';
import Branch from '../models/branch';
import Sales from '../models/sales';
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

  // return  false;

  const { branchId, dateBet, dateTill } = req.body;

  if (dateBet !== '' && dateTill !== '') {

    // const bet1 = new Date(dateBet).toISOString();
    // const till1 = new Date(dateTill).toISOString();

    const bet1 = new Date(dateBet);
    // const bet2 = new Date(bet1);
    bet1.setDate(bet1.getDate() + 1);
    const betResult = new Date(bet1).toISOString().split('T')[0];

    const till1 = new Date(dateTill);
    // const till2 = new Date(till1);
    till1.setDate(till1.getDate() + 1);
    const tillResult = new Date(till1).toISOString().split('T')[0];

    const sales = await Sales.find({ _storeId: req.user._storeId, _branchId: branchId, createdAt: { $gte: betResult, $lte: tillResult } })
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


  const { branchId, dateBet, dateTill } = req.body;

  if (dateBet !== '' && dateTill !== '') {

    // const bet1 = new Date(dateBet).toISOString();
    // const till1 = new Date(dateTill).toISOString();

    const bet1 = new Date(dateBet);
    // const bet2 = new Date(bet1);
    bet1.setDate(bet1.getDate() + 1);
    const betResult = new Date(bet1).toISOString().split('T')[0];

    const till1 = new Date(dateTill);
    // const till2 = new Date(till1);
    till1.setDate(till1.getDate() + 1);
    const tillResult = new Date(till1).toISOString().split('T')[0];

    console.log(betResult);
    console.log(tillResult);

    //console.log(bet1);
    //console.log(till1);

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
