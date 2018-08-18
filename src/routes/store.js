import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Branch from '../models/branch';
import Role from '../models/role';
import Category from '../models/category';
import Business from '../models/business';
import Account from '../models/account';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';

const router = express.Router();


router.get('/register', async (req, res) => {
  const business = await Business.find();
  res.render('site/register', { business, expressFlash: req.flash('info'), layout: 'layouts/site' });
});


const generateUniqueID = async storeShort => {
  const ADMIN_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: ADMIN_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return ADMIN_ID;
};


router.post('/create-store', async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    var errors = req.validationErrors();

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'company email is required').isEmail();
    req.checkBody('phone', 'Phone Number is required').notEmpty();
    req.checkBody('address', 'Address is required').notEmpty();
    req.checkBody('shortCode', 'shortCode is required').notEmpty();
    req.checkBody('businessType', 'Business Type is required').notEmpty();
    req.checkBody('country', 'Country is required').notEmpty();
    req.checkBody('state', 'State is required').notEmpty();
    req.checkBody('city', 'City is required').notEmpty();

    req.checkBody('branch_email', 'Branch E-mail is required').isEmpty();
    req.checkBody('branch_address', 'Branch Address is required').notEmpty();
    req.checkBody('branch_phone', 'Branch Phone is required').notEmpty();
    req.checkBody('branch_country', 'Country is required').notEmpty();
    req.checkBody('branch_state', 'State is required').notEmpty();
    req.checkBody('branch_city', 'City is required').notEmpty();


    req.checkBody('role', 'Select Your Role').notEmpty();
    req.checkBody('firstname', 'firstname is required').notEmpty();
    req.checkBody('lastname', 'Lastname is required').notEmpty();
    req.checkBody('admin_address', 'Admin Home Address is required').notEmpty();
    req.checkBody('admin_phone', 'Admin Phone Number is required').notEmpty();
    req.checkBody('admin_email', 'Admin Email is required').isEmail();

    console.log(errors);

    if (errors) {
      req.session.errors = errors;
      res.redirect('/store/register');
    } else {
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
                               newBranch.name = `${fields.branch_name}(H.B)`;
                               newBranch.address = fields.branch_address;
                               newBranch.email = fields.branch_email;
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
                               newAdmin.roleId = 'admin';
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
    }
  });
});


// create account roles
//router.get('/roles', guard.ensureLoggedIn(), async (req, res) => {
router.get('/roles', async (req, res) => {
  // const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  // const roles = await Role.find({ _storeId: req.session._storeId }).populate('_accountId');
  // const category = await Category.find({ _storeId: req.session._storeId });
  // const business = await Business.find({ _storeId: req.session._storeId });
  res.render('role/manage', { expressFlash: req.flash('success'), layout: 'layouts/user' });
  //res.render('role/manage', { user, roles, category, business, expressFlash: req.flash('success'), layout: 'layouts/user' });
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
router.post('/business', guard.ensureLoggedIn(), async (req, res, next) => {

  const business = await Business();

  business.name = req.body.name;
  await business.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'Business Saved Successfully');
      res.redirect('/store/roles');
    }
  });
});


// category page
router.get('/categories', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const categories = await Category.find({ _storeId: req.session._storeId });
  const category = await Category.findOne({ _storeId: req.session._storeId });
  res.render('product/category', { user, categories, category, expressFlash: req.flash('success'), layout: 'layouts/user' });
});

// Add ctegory
router.post('/category', guard.ensureLoggedIn(), async (req, res, next) => {

  const category = await Category();

  category._storeId = req.session._storeId;
  category.name = req.body.name;
  category.description = req.body.description;
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


router.post('/showus', async (req, res, next) => {
console.log(req.body);
});

export default router;
