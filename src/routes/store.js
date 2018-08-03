import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Branch from '../models/branch';
import Role from '../models/role';
import Category from '../models/category';
import Bussiness from '../models/bussiness';
import Account from '../models/account';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';

const router = express.Router();


router.get('/register', async (req, res) => {
  const bussiness = await Bussiness.find();
  res.render('site/register', { bussiness, expressFlash: req.flash('info'), layout: 'layouts/site' });
});


const generateUniqueID = async storeShort => {
  const ADMIN_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: ADMIN_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return ADMIN_ID;
};


// router.post('/create-store', guard.ensureLoggedIn(), async (req, res, next) => {
router.post('/create-store', async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    // fields.checkBody('name', 'company name is required').isEmpty();
    // fields.checkBody('email', 'company email is required').isEmail();

    try {
      const newStore = new Store();
      const logo = files.logo;
      newStore.name = fields.name;
      newStore.email = fields.email;
      newStore.phone = fields.phone;
      newStore.address = fields.address;
      newStore.shortCode = fields.shortCode;
      newStore.website = fields.website;
      newStore._businessId = fields.businessType;
      newStore.country = fields.country;
      newStore.state = fields.state;
      newStore.city = fields.city;
      if (logo && logo.name) {
        const name = `${Math.round(Math.random() * 10000)}.${logo.name.split('.').pop()}`;
        const dest = path.join(__dirname, '..', 'public', 'images', 'store', name);
        fs.readFile(logo.path, function(err, data) {
          fs.writeFile(dest,
                       data, function(err) {
                         fs.unlink(logo.path, async (err) => {
                           if (err) {
                             res.status(500);
                             res.json(err);
                           } else {
                             newStore.logo = name;
                             await newStore.save(function(err) {
                               if (err) {
                                 console.log(err);
                               }
                             });
                             const newBranch = new Branch();
                             newBranch._storeId = newStore._id;
                             newBranch.name = `(H.B)${fields.branch_name}`;
                             newBranch.address = fields.branch_address;
                             newBranch.phone = fields.branch_phone;
                             newBranch.country = fields.branch_country;
                             newBranch.state = fields.branch_state;
                             newBranch.city = fields.branch_city;
                             await newBranch.save(function(err) {
                               if (err) {
                                 console.log(err);
                               }

                             });

                             const newAdmin = fields;
                             const password = newAdmin.password;
                             delete newAdmin.password;
                             newAdmin.role = fields.role;
                             newAdmin._storeId = newStore._id;
                             newAdmin._branchId = newBranch._id;
                             newAdmin.username = await generateUniqueID(newStore.shortCode);
                             newAdmin.firstname = fields.firstname;
                             newAdmin.middlename = fields.middlename;
                             newAdmin.lastname = fields.lastname;
                             newAdmin.address = fields.admin_address;
                             newAdmin.phone = fields.admin_phone;
                             newAdmin.email = fields.admin_email;
                             Account.register(new Account(newAdmin), password,
                                              (err, account) => {
                                                if (err) {
                                                  console.log(err);
                                                } else {
                                                  req.flash('info', `Store created successfully Your Key is ${newAdmin.username}, This is the Key you will use to login to your Company`);
                                                  res.redirect('/login');
                                                }
                                              });
                           }
                         });
                       });
        });
      }
    } catch (e) {
      console.log(e);
    }
  });
});


// create account roles
router.get('/roles', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId');
  const roles = await Role.find({ _storeId: req.session._storeId }).populate('_accountId');
  const category = await Category.find({ _storeId: req.session._storeId });
  const bussiness = await Bussiness.find({ _storeId: req.session._storeId });
  res.render('role/manage', { user, roles, category, bussiness, expressFlash: req.flash('success'), layout: 'layouts/user' });
});


// update branch
router.post('/roles', guard.ensureLoggedIn(), async (req, res, next) => {

  const role = await Role(req.body);
  role._storeId = req.session._storeId;
  role._accountId = req.user._id;

  await role.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'Role Saved Successfully');
      res.redirect('/store/roles');
    }
  });
});


// add bussiness type
router.post('/bussiness', guard.ensureLoggedIn(), async (req, res, next) => {

  const bussiness = await Bussiness();

  bussiness.name = req.body.name;
  await bussiness.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'Bussiness Saved Successfully');
      res.redirect('/store/roles');
    }
  });
});


// category page
router.get('/categories', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId');
  const categories = await Category.find({ _storeId: req.session._storeId });
  const category = await Category.findOne({ _storeId: req.session._storeId });
  res.render('product/category', { user, categories, category, expressFlash: req.flash('success'), layout: 'layouts/user' });
});

// Add ctegory
router.post('/category', guard.ensureLoggedIn(), async (req, res, next) => {

  const category = await Category();

  category._storeId = req.session._storeId;
  category.name = req.body.name;
  category.discription = req.body.discription;
  await category.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'Category Saved Successfully');
      res.redirect('/store/categories');
    }
  });
});


// update ctegory
router.post('/category/update', guard.ensureLoggedIn(), async (req, res, next) => {

  const category = await Category.findById(req.body._categoryId);

  console.log(category);

  category.name = req.body.name;
  category.discription = req.body.discription;
  await category.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'Category Update Successfully');
      res.redirect('/store/categories');
    }
  });
});


// delete ctegory
router.post('/category/delete', guard.ensureLoggedIn(), async (req, res, next) => {

  await Category.findById(req.body.id).remove();
  res.send('success');
});


export default router;
