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
import Supply from '../models/supply';


const router = express.Router();


const generateUniqueID = async storeShort => {
  const MEMBER_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: MEMBER_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return MEMBER_ID;
};


router.get('/dashboard', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const suppliers = await Supply.find({ _storeId: req.user._storeId });
  const categories = await Category.find({ _storeId: req.session._storeId });
  const branches = await Branch.find({ _storeId: req.session._storeId });
  res.render('supply/dashboard', { user, expressFlash: req.flash('info'), suppliers, branches, categories, layout: 'layouts/user' });
});


router.get('/', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const suppliers = await Supply.find({ _storeId: req.user._storeId });
  const categories = await Category.find({ _storeId: req.session._storeId });
  const branches = await Branch.find({ _storeId: req.session._storeId });
  res.render('supply/manage', { user, expressFlash: req.flash('info'), suppliers, branches, categories, layout: 'layouts/user' });
});


router.post('/', guard.ensureLoggedIn(), async (req, res, next) => {

  const store = await Store.findById(req.user._storeId);
  var errors = req.validationErrors();

  const firstname = req.body.firstname;
  const middlename = req.body.middlename;
  const lastname = req.body.lastname;
  const phone = req.body.phone;
  const email = req.body.email;
  const address = req.body.address;


  req.checkBody('firstname', 'First name is required').notEmpty();
  req.checkBody('lastname', 'Last name is required').notEmpty();
  req.checkBody('phone', 'Phone is required').notEmpty();
  req.checkBody('address', 'Address is required').notEmpty();
  req.checkBody('email', 'E-mail is required').notEmpty();

  console.log(errors);

  if (errors) {
    req.flash('info', 'Error Creating Supplier');
    res.redirect('/supplier');
  } else {
    const supplier = await Supply(req.body);
    supplier._storeId = req.user._storeId;
    supplier._supplierId = 'supplier';
    supplier.show = true;
    supplier.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('info', 'Supplier Created Successfully');
        res.redirect('/supplier');
      }
    });
  }
});


router.post('/update', guard.ensureLoggedIn(), async (req, res, next) => {

  const supplier = await Supply.findById(req.body._supplierId);

  const firstname = req.body.firstname;
  const middlename = req.body.middlename;
  const lastname = req.body.lastname;
  const phone = req.body.phone;
  const email = req.body.email;
  const address = req.body.address;

  req.checkBody('firstname', 'First name is required').notEmpty();
  req.checkBody('lastname', 'Last name is required').notEmpty();
  req.checkBody('phone', 'Phone is required').notEmpty();
  req.checkBody('email', 'E-mail', 'E-mail is required').isEmail();
  req.checkBody('address', 'Address is required').notEmpty();

  var errors = req.validationErrors();

  console.log(errors);

  if (errors) {
    req.session.errors = errors;
    res.redirect('/supplier');
  } else {

    supplier.firstname = req.body.firstname;
    supplier.middlename = req.body.middlename;
    supplier.lastname = req.body.lastname;
    supplier.phone = req.body.phone;
    supplier.email = req.body.email;
    supplier.address = req.body.address;
    supplier.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('info', 'Supplier Updated Successfully');
        res.redirect('/supplier');
      }
    });
  }
});


router.post('/delete', guard.ensureLoggedIn(), async (req, res) => {

  const id = req.body.id;
  await Supply.findByIdAndRemove(id);
  res.send('success');
});


router.get('/view/:id', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const products = await Product.find({ _storeId: req.user._storeId, _supplierId: req.params.id }).populate('_categoryId');
  res.render('supply/view', { user, expressFlash: req.flash('info'), products, layout: 'layouts/user' });
});


export default router;
