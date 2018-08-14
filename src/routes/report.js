import express from 'express';
import Store from '../models/store';
import Role from '../models/role';
import Account from '../models/account';
import Branch from '../models/branch';
import Sales from '../models/sales';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';

const router = express.Router();


router.get('/', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  res.render('report/manage', { user, branches, layout: 'layouts/user' });
});


router.post('/get/sales', guard.ensureLoggedIn(), async (req, res) => {
  
  const sales = await Sales.find({ _storeId: req.user._storeId, _branchId: req.body.branchId })
                            .populate('_productId').populate('_branchId')
                            .populate('_salesBy').populate('_customerId');
  
  return res.json(sales);
});


// manage staff
router.get('/staff', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId');
  const branches = await Branch.find({ _storeId: req.session._storeId });
  const roles = await Role.find({ _storeId: req.session._storeId });
  const staff = await Account.find({ _storeId: req.user._storeId })
                                    .populate('_roleId').populate('_branchId');
  res.render('staff/staff', { user, staff, roles, branches, expressFlash: req.flash('success'), 
                              layout: 'layouts/user' });
});


export default router;
