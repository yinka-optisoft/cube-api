import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Role from '../models/role';
import Account from '../models/account';
import Branch from '../models/branch';
import Product from '../models/product';
import Supply from '../models/supply';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateUniqueID = async storeShort => {
  const MEMBER_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: MEMBER_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return MEMBER_ID;
};


router.get('/dashboard', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branch = await Branch.count({ _storeId: req.user._storeId });
  const product = await Product.count({ _storeId: req.user._storeId });
  const account = await Account.count({ _storeId: req.user._storeId });
  const suppliers = await Supply.count({ _storeId: req.user._storeId });
  res.render('admin/dashboard', { user, branch, product, account, suppliers, expressFlash: req.flash('success'),
                                  layout: 'layouts/user' });
});


// manage staff
router.get('/staff', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branches = await Branch.find({ _storeId: req.session._storeId });
  const roles = await Role.find({ _storeId: req.session._storeId });
  const admins = await Account.find({ _storeId: req.user._storeId })
                                    .populate('_roleId').populate('_branchId');

  // note that due to check exists query filter the store admin and any other staff that have
  // the same privilege as admin out
  const staff = await Account.find({ _storeId: req.user._storeId, _roleId: { $exists: true } })
                                    .populate('_roleId').populate('_branchId');
  res.render('staff/staff', { user, staff, admins, roles, branches, expressFlash: req.flash('success'),
                              layout: 'layouts/user' });
});


// manage admins
router.get('/admins', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branches = await Branch.find({ _storeId: req.session._storeId });
  const roles = await Role.find({ _storeId: req.session._storeId });
  const admins = await Account.find({ _storeId: req.user._storeId, roleId: { $exists: true } })
                                    .populate('_roleId').populate('_branchId');
  res.render('staff/admin', { user, admins, roles, branches, expressFlash: req.flash('success'),
                              layout: 'layouts/user' });
});


// staff trash
router.get('/trash', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const staff = await Account.find({ _storeId: req.session._storeId, status: 0 })
                                    .populate('_roleId').populate('_branchId');
  res.render('staff/trash', { user, staff, layout: 'layouts/user' });
});


router.post('/new-member', guard.ensureLoggedIn(), async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    const user = await Account.findOne({ email: fields.email });

    if (user) {

      req.flash('success', 'E-mail Or Username Already Exist');
      res.redirect('/admin/staff/');

    } else {

      const store = await Store.findById(req.user._storeId);


      if (!store)
        return res.status(400).json({ message: 'Store doesn\'t exist!' });
      const passport = files.passport;
      const member = fields;
      const password = member.password;
      delete member.password;
      const name = `${Math.round(Math.random() * 10000)}.${passport.name.split('.').pop()}`;
      const dest = path.join(__dirname, '..', 'public', 'images', 'member', name);
      member._storeId = store._id;
      // member._branchId = branchId;
      member.status = 1;
      // member.username = await generateUniqueID(store.shortCode);
      // member.username = `${storeSub}-field.username`;
      member.username = fields.username;
      fs.readFile(passport.path, function(err, data) {
        fs.writeFile(dest,
                     data, function(err) {
                       fs.unlink(passport.path, function(err) {
                         if (err) {
                           console.log(err);
                         } else {
                           member.passport = name;

                           Account.register(new Account(member), password,
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
                                              } else if (account.roleId === 'admin') {
                                                req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                                                res.redirect('/admin/admins/');
                                              } else {
                                                req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                                                res.redirect('/admin/staff/');
                                              }
                                            });

                         }
                       });
                     });
      });
    }
  });
});


// restore user
router.post('/restore', guard.ensureLoggedIn(), async (req, res) => {

  const id = req.body.id;
  const user = await Account.findById(id);

  if (user.status === false) {
    user.status = 1;
    user.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.send('success');
      };
    });
  }
});


// delete user permanetly
router.post('/delete', guard.ensureLoggedIn(), async (req, res) => {

  const user = await Account.findById(req.user._id);

  if (user.roleId === 'admin' && user.rightToDeleteAdmin === true) {
    const id = req.body.id;
    await Account.findById(id).remove();
    res.send('success');
  } else {
    res.send('fail');
  }
});


// move user from one staff to another
router.post('/post', guard.ensureLoggedIn(), async (req, res) => {

  const post = await Account.findById(req.body.user);
  post._branchId = req.body._branchId;
  post.moveDate = new Date();
  post.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', `${post.firstname} ${post.lastname} Moved`);
      res.redirect('/admin/staff');
    };
  });
});


export default router;
