import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Branch from '../models/branch';
import Account from '../models/account';
import Role from '../models/role';
import Category from '../models/category';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';
import Product from '../models/product';
import BranchProduct from '../models/branchProduct';
import jwt from 'jsonwebtoken';
import Subscription from '../models/subscription';

const router = express.Router();

const generateUniqueID = async storeShort => {
  const MEMBER_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: MEMBER_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return MEMBER_ID;
};


// branch homepage
router.get('/admin/dashboard/:_storeId/:_branchId', guard.ensureLoggedIn(), async (req, res, next) => {

  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branches = await Branch.find({ _storeId: req.session._storeId });
  const branch = await Branch.findById(req.params._branchId);
  const productCount = await BranchProduct.count({ _storeId: req.user._storeId, _branchId: branch._id });
  const products = await BranchProduct.find({ _storeId: req.user._storeId, pieces: { $lte: 10 }, _branchId: req.user._branchId }).populate('_branchId').populate('_productId');
  res.render('branch/adminDashboard', { user, products, expressFlash: req.flash('info'), branch, branches, productCount, layout: 'layouts/user' });
});


router.get('/', guard.ensureLoggedIn(), async (req, res, next) => {

  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branches = await Branch.find({ _storeId: req.session._storeId });
  res.render('branch/manage', { user, expressFlash: req.flash('info'), branches, layout: 'layouts/user' });
});

// create new branch
router.post('/', guard.ensureLoggedIn(), async (req, res, next) => {

  // get current date
  const currentDate = new Date();

  const numOfBra = await Branch.count({ _storeId: req.user._storeId });
  const sub = await Subscription.findOne({ _storeId: req.user._storeId, expiredDate: { $gte: currentDate } })
                                .populate('_packageId').populate('_licenseId');


  if (sub._licenseId.licenseName === 'Value' || sub._packageId.category === 'Value') {

    if (numOfBra !== 1) {

      const newBranch = await Branch();
      newBranch._storeId = req.session._storeId;
      newBranch.name = req.body.name;
      newBranch.email = req.body.email;
      newBranch.phone = req.body.phone;
      newBranch.address = req.body.address;
      newBranch.country = req.body.country;
      newBranch.state = req.body.state;
      newBranch.city = req.body.city;
      newBranch.status = true;
      newBranch.mainBranch = false;
      newBranch.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          req.flash('info', 'Branch Saved Successfully');
          res.redirect('/branch');
        }
      });
    } else {
      req.flash('info', 'Sorry You can\'t Have More than 1 Shop On This Package');
      res.redirect('/branch');
    }

  } else if (sub._licenseId.licenseName === 'Enterprise' || sub._packageId.category === 'Enterprise') {

    if (numOfBra !== 3) {

      const newBranch = await Branch();
      newBranch._storeId = req.session._storeId;
      newBranch.name = req.body.name;
      newBranch.email = req.body.email;
      newBranch.phone = req.body.phone;
      newBranch.address = req.body.address;
      newBranch.country = req.body.country;
      newBranch.state = req.body.state;
      newBranch.city = req.body.city;
      newBranch.status = true;
      newBranch.mainBranch = false;
      newBranch.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          req.flash('info', 'Branch Saved Successfully');
          res.redirect('/branch');
        }
      });
    } else {
      req.flash('info', 'Sorry You can\'t Have More than 3 Shops On This Package');
      res.redirect('/branch');
    }

  } else if (sub._licenseId.licenseName === 'Diamond' || sub._packageId.category === 'Diamond') {

    const newBranch = await Branch();
    newBranch._storeId = req.session._storeId;
    newBranch.name = req.body.name;
    newBranch.email = req.body.email;
    newBranch.phone = req.body.phone;
    newBranch.address = req.body.address;
    newBranch.country = req.body.country;
    newBranch.state = req.body.state;
    newBranch.city = req.body.city;
    newBranch.status = true;
    newBranch.mainBranch = false;
    newBranch.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        req.flash('info', 'Branch Saved Successfully');
        res.redirect('/branch');
      }
    });

  }
});


// update branch
router.post('/update', guard.ensureLoggedIn(), async (req, res, next) => {

  const branch = await Branch.findById(req.body._branchId);

  branch._storeId = req.session._storeId;
  branch.name = req.body.name;
  branch.email = req.body.email;
  branch.phone = req.body.phone;
  branch.address = req.body.address;
  branch.country = req.body.country;
  branch.state = req.body.state;
  branch.city = req.body.city;
  await branch.save(function(err) {
    if (err) {
      console.log(err);
      req.flash('info', 'Unable To Update Branch');
      res.redirect('/branch');
    } else {
      req.flash('info', 'Branch Update Saved Successfully');
      res.redirect('/branch');
    }
  });
});


// branch homepage
router.get('/view/:_branchId', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branch = await Branch.findById(req.params._branchId);
  const roles = await Role.find({ _storeId: req.session._storeId });


  // note that due to check exists query filter the store admin and any other staff that have
  // the same privilege as admin out
  const staff = await Account.find({ _storeId: req.user._storeId, _branchId: branch._id, _roleId: { $exists: true } })
                                    .populate('_roleId').populate('_branchId');
  const productCount = await BranchProduct.count({ _storeId: req.user._storeId, _branchId: branch._id })
                                      .populate(
                                        { path: '_productId',
                                          populate: { path: '_categoryId' } });
  const products = await BranchProduct.find({ _storeId: req.user._storeId, pieces: { $lte: 10 }, _branchId: branch._id }).populate('_branchId').populate('_productId');
  res.render('branch/branchDashboard', { user, products, staff, roles, branch, productCount, expressFlash: req.flash('success'), layout: 'layouts/user' });
});


// delete branch
router.post('/delete', guard.ensureLoggedIn(), async (req, res) => {
  const id = req.body.id;
  const trueBranch = await Branch.findOne({ _id: id, headBranch: true });
  if (trueBranch) {
    req.flash('info', 'You can\'t Delete Head Branch');
    res.redirect('/branch');
  } else {
    await Branch.findOne({ _id: id, headBranch: false }).remove();
    res.send('success');
  }
});

// check for email validation
router.post('/check/email', guard.ensureLoggedIn(), async (req, res) => {

  const email = req.body.email;

  const user = await Account.findOne({ email: email });

  if (user) {
    res.send('success');
  } else {
    res.send('failure');
  }
});


// check for username validation
router.post('/check/username', guard.ensureLoggedIn(), async (req, res) => {

  const username = req.body.username;

  const user = await Account.findOne({ username: username });

  if (user) {
    res.send('success');
  } else {
    res.send('failure');
  }
});


// add new member
router.post('/member/:_branchId', guard.ensureLoggedIn(), async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    const user = await Account.findOne({ email: fields.email });

    if (user) {

      req.flash('success', 'E-mail Already Exist');
      res.redirect('/admin/staff/');

    } else {

      const store = await Store.findById(req.user._storeId);

      const convertToUpper = store.name;
      const storeName = convertToUpper.toUpperCase();
      const storeSub = storeName.substring(0, 3);

      const branchId = req.params._branchId;

      if (!store)
        return res.status(400).json({ message: 'Store doesn\'t exist!' });
      const passport = files.passport;
      const member = fields;
      const password = member.password;
      delete member.password;
      member._storeId = store._id;
      member._branchId = branchId;
      member.status = 1;
      member.phone = `+234${fields.phone}`;
      member.username = `${storeSub}-${fields.username}`;
      if (passport && passport.name) {
        const name = `${Math.round(Math.random() * 10000)}.${passport.name.split('.').pop()}`;
        const dest = path.join(__dirname, '..', 'public', 'images', 'member', name);
        const data = fs.readFileSync(passport.path);
        fs.writeFileSync(dest, data);
        fs.unlinkSync(passport.path);
        member.passport = name;
      }
      Account.register(
        new Account(member), password, async (err, account) => {
          const tokenG = await Account.findById(account._id);
          // console.log(tokenG);
          tokenG.token = await jwt.sign({ id: account._id }, 'cube7000Activated');
          await tokenG.save(function(err) {
            if (err) {
              console.log(err);
            }
            // console.log(tokenG);
          });

          if (err) {
            res.status(500);
            res.send(err);
          } else {
            req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
            if (req.user._roleId === 'admin') {
              res.redirect('/admin/staff/');
            } else if (req.user._roleId === 'staff') {
              res.redirect(`/branch/view/${ branchId}`);
            }
          }
        });
    };
  });
});


router.post('/ban', guard.ensureLoggedIn(), async (req, res) => {

  const id = req.body.id;
  const user = await Account.findById(id);
  if (user.roleId === 'admin' && user.rightToDeleteAdmin === true) {
  // if (user.roleId === 'admin') {
    res.send('fail');
  } else if (user.status === false) {
    user.status = 1;
    user.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.send('success');
      };
    });
  } else {
    user.status = 0;
    user.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.send('success');
      };
    });
  }
});


// branch homepage
router.get('/user/view/:_userId', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const users = await Account.findById(req.params._userId).populate('_roleId');
  const roles = await Role.find({ _storeId: req.session._storeId });
  const branch = await Branch.findById(user._branchId);
  res.render('branch/viewMember', { user, roles, branch, users, expressFlash: req.flash('success'), layout: 'layouts/user' });
});


// update member
router.post('/user/update/:_branchId', guard.ensureLoggedIn(), async (req, res, next) => {

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    const store = await Store.findById(req.session._storeId);
    const getmember = await Account.findById(fields._memberId);

    if (!store)
      return res.status(400).json({ message: 'Store doesn\'t exist!' });
    const passport = files.passport;
    const member = fields;
    if (passport && passport.name) {
      const name = `${Math.round(Math.random() * 10000)}.${passport.name.split('.').pop()}`;
      const dest = path.join(__dirname, '..', 'public', 'images', 'member', name);
      const data = fs.readFileSync(passport.path);
      fs.writeFileSync(dest, data);
      fs.unlinkSync(passport.path);
      member.passport = name;
    }
    getmember.update(member, function(err) {
      if (err) {
        console.log(err);
      } else {
        req.flash('success', 'Profile Update Successfully');
        // req.flash('success', `${getmember.firstname} update successfully`);
        res.redirect(`/branch/user/view/${getmember._id}`);
      }
    });
  });

});


// Add ctegory
router.post('/category', guard.ensureLoggedIn(), async (req, res, next) => {

  const branch = req.body._branchId;

  const category = await Category();
  category._storeId = req.session._storeId;
  category.name = req.body.name;
  await category.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', 'Category Saved Successfully');
      res.redirect(`/branch/view/${branch}`);
    }
  });
});


router.get('/view/:_branchId/products', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branch = await Branch.findById(req.params._branchId);
  const products = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: branch._id })
                                      .populate(
                                        { path: '_productId',
                                          populate: { path: '_categoryId' } });

  res.render('branch/branchProduct', { user, products, branch, expressFlash: req.flash('success'), layout: 'layouts/user' });
});


export default router;
