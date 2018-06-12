import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Role from '../models/role';
import Account from '../models/account';
import Branch from '../models/branch';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';

const router = express.Router();

const generateUniqueID = async storeShort => {
  const MEMBER_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: MEMBER_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return MEMBER_ID;
};


router.get('/dashboard', guard.ensureLoggedIn(), async (req, res) => {
  res.render('admin/dashboard', { layout: 'layouts/user' });
});


// manage staff
router.get('/staff', guard.ensureLoggedIn(), async (req, res) => {
  const branches = await Branch.find({ _storeId: req.session._storeId });
  const roles = await Role.find({ _storeId: req.session._storeId });
  const staff = await Account.find({ _storeId: req.session._storeId })
                                    .populate('_roleId').populate('_branchId');
  res.render('staff/staff', { staff, roles, branches, expressFlash: req.flash('success'), 
                              layout: 'layouts/user' });
});


// staff trash
router.get('/trash', guard.ensureLoggedIn(), async (req, res) => {
  const staff = await Account.find({ _storeId: req.session._storeId, status: 0 })
                                    .populate('_roleId').populate('_branchId');
  res.render('staff/trash', { staff, layout: 'layouts/user' });
});


// add new member
router.post('/new-member', guard.ensureLoggedIn(), async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    const store = await Store.findById(req.session._storeId);

    // const branchId = req.params._branchId;

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
    member.username = await generateUniqueID(store.shortCode);
    fs.readFile(passport.path, function(err, data) {
      fs.writeFile(dest,
                   data, function(err) {
                     fs.unlink(passport.path, function(err) {
                       if (err) {
                         res.status(500);
                         res.json(err);
                       } else {
                         member.passport = name;
                         Account.register(
                           new Account(member), password, (err, account) => {
                             if (err) {
                               res.status(500);
                               res.send(err);

                             } else {
                               req.flash('success', `Saved sucessfully! Your Username is ${member.username}`);
                               res.redirect('/admin/staff');
                             }
                           });
                       }
                     });
                   });
    });
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

  const id = req.body.id;
  await Account.findById(id).remove();

  res.send('success');

});


// move user from one staff to another
router.post('/post', guard.ensureLoggedIn(), async (req, res) => {

  const post = await Account.findById(req.body.user);
  post._branchId = req.body._branchId;

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
