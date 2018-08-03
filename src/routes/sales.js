import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Branch from '../models/branch';
import Account from '../models/account';
import Role from '../models/role';
import Category from '../models/category';
import Product from '../models/product';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';
import Customer from '../models/customer';
import BranchProduct from '../models/branchProduct';

const router = express.Router();


router.get('/create/sales', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId');
  const customers = await Customer.find({ _storeId: req.user._storeId, _branchId: req.user._branchId });
  const products = await Product.find({ _storeId: req.user._storeId, _branchId: req.user._branchId });
  res.render('sales/createSales', { user, expressFlash: req.flash('info'), customers, products, layout: 'layouts/user' });
});

router.post('/get/pieces', guard.ensureLoggedIn(), async (req, res, next) => {
    const product = await BranchProduct.findOne({ _productId: req.body._productId, _branchId: req.user._branchId })
                                      .populate('_categoryId').populate('_productId');
    return res.json(product);
  });
  


router.get('/manage/sales', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId');
  const suppliers = await Account.find({ _storeId: req.user._storeId, _supllyId: 'supplier' });
  const categories = await Category.find({ _storeId: req.session._storeId });
  const branches = await Branch.find({ _storeId: req.session._storeId });
  res.render('sales/manageSales', { user, expressFlash: req.flash('info'), suppliers, branches, categories, layout: 'layouts/user' });
});


router.post('/create/customer', guard.ensureLoggedIn(), async (req, res, next) => {

    console.log(req.body);

    let name = req.body.name;
    let phone = req.body.phone;
    let email = req.body.email;
    let address = req.body.address;
    

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('phone', 'Phone is required').notEmpty();
    req.checkBody('address', 'Address is required').notEmpty();
    req.checkBody('email', 'E-mail', 'E-mail is required').isEmail();
    
    var errors = req.validationErrors();

    console.log(errors);

    if(errors) {
        req.session.errors = errors;
        res.redirect('/sales/create/sales');
    } else {

        const customer = await Customer(req.body);
        customer._storeId = req.user._storeId;
        customer._branchId = req.user._branchId;
        customer._createdBy = req.user._id;
        customer.save((err) => {
            if (err) {
            console.log(err);
            } else {
                req.flash('info', 'Customer Created');
                res.redirect('/sales/create/sales');
            }
        });
    }

});


export default router;
