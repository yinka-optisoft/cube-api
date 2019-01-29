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
import jwt from 'jsonwebtoken';
import Subscription from '../models/subscription';

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
    // req.checkBody('shortCode', 'shortCode is required').notEmpty();
    req.checkBody('businessType', 'Business Type is required').notEmpty();
    req.checkBody('country', 'Country is required').notEmpty();
    req.checkBody('state', 'State is required').notEmpty();
    req.checkBody('city', 'City is required').notEmpty();

    /* req.checkBody('branch_email', 'Branch E-mail is required').isEmpty();
    req.checkBody('branch_address', 'Branch Address is required').notEmpty();
    req.checkBody('branch_phone', 'Branch Phone is required').notEmpty();
    req.checkBody('branch_country', 'Country is required').notEmpty();
    req.checkBody('branch_state', 'State is required').notEmpty();
    req.checkBody('branch_city', 'City is required').notEmpty();*/


    /* req.checkBody('role', 'Select Your Role').notEmpty();
    req.checkBody('firstname', 'firstname is required').notEmpty();
    req.checkBody('lastname', 'Lastname is required').notEmpty();
    req.checkBody('admin_address', 'Admin Home Address is required').notEmpty();
    req.checkBody('admin_phone', 'Admin Phone Number is required').notEmpty();
    req.checkBody('admin_email', 'Admin Email is required').isEmail();*/

    console.log(errors);

    if (errors) {
      // req.session.errors = errors;
      res.redirect('/store/register');
    } else {
      try {

        const convertToUpper = fields.name;
        const storeName = convertToUpper.toUpperCase();
        const storeSub = storeName.substring(0, 3);

        // console.log(`${storeSub}-field.username`);

        // console.log(storeName);
        // console.log(storeSub);

        // return false;

        const newStore = new Store();
        const logo = files.logo;
        newStore.name = fields.name;
        newStore.email = fields.email;
        newStore.phone = fields.phone;
        newStore.address = fields.address;
        newStore.shortCode = storeName;
        newStore.website = fields.website;
        newStore._businessId = fields.businessType;
        newStore.country = fields.country;
        newStore.state = fields.state;
        newStore.city = fields.city;
        if (logo && logo.name) {
          const name = `${Math.round(Math.random() * 10000)}.${logo.name.split('.').pop()}`;
          const dest = path.join(__dirname, '..', 'public', 'images', 'store', name);
          const data = fs.readFileSync(logo.path);
          fs.writeFileSync(dest, data);
          fs.unlinkSync(logo.path);
          newStore.logo = name;
        }
        await newStore.save(function(err) {
          if (err) {
            console.log(err);
          }
        });

        const newBranch = new Branch();
        newBranch._storeId = newStore._id;
        newBranch.name = `${newStore.name}(H.B)`;
        newBranch.address = newStore.address;
        newBranch.email = newStore.email;
        newBranch.phone = `+234${newStore.phone}`;
        newBranch.country = newStore.country;
        newBranch.state = newStore.state;
        newBranch.city = newStore.city;
        newBranch.headBranch = true;
        await newBranch.save(function(err) {
          if (err) {
            console.log(err);
          }
        });

        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + 1);

        const sub = await Subscription();
        sub._storeId = newStore._id;
        sub.activateDate = Date();
        sub.expiredDate = currentDate;
        sub.expired = false;
        sub.save((err) => {
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
        newAdmin.username = await generateUniqueID(storeSub);
        newAdmin.name = newStore.name;
        newAdmin.rightToDeleteAdmin = true;
        /* newAdmin.firstname = fields.firstname;
                               newAdmin.middlename = fields.middlename;
                               newAdmin.lastname = fields.lastname;
                               newAdmin.address = fields.admin_address;
                               newAdmin.phone = fields.admin_phone;
                               newAdmin.email = fields.admin_email;*/
        Account.register(new Account(newAdmin), password,
                         async (err, account) => {

                           // return false;
                           const tokenG = await Account.findById(account._id);
                           console.log(tokenG);
                           tokenG.token = await jwt.sign({ id: account._id }, 'cube7000Activated');
                           await tokenG.save(function(err) {
                             if (err) {
                               console.log(err);
                             }
                             console.log(tokenG);
                           });

                           if (err) {
                             console.log(err);
                           } else {
                             req.flash('info', `Store created successfully Your Key is ${newAdmin.username}, This is the Key you will use to login to your Company`);
                             res.redirect('/login');
                           }
                         });

      } catch (e) {
        console.log(e);
      }
    }
  });
});


// create account roles
router.get('/roles', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const roles = await Role.find({ _storeId: req.session._storeId }).populate('_accountId');
  const category = await Category.find({ _storeId: req.session._storeId });
  const business = await Business.find();
  res.render('role/manage', { user, roles, category, business, expressFlash: req.flash('success'), layout: 'layouts/user' });
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


router.post('/delete/role', guard.ensureLoggedIn(), async (req, res) => {

  console.log(req.body);

  const id = req.body.id;
  await Role.findByIdAndRemove(id);
  res.send('success');
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
  category.description = req.body.description;
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
