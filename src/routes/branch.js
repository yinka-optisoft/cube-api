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

const router = express.Router();

const generateUniqueID = async storeShort => {
  const MEMBER_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: MEMBER_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return MEMBER_ID;
};



// branch homepage
router.get('/', guard.ensureLoggedIn(), async (req, res, next) => {
    const branches = await Branch.find({ _storeId: req.session._storeId });
    const branch = await Branch.findOne({ _storeId: req.session._storeId });
    res.render('branch/manage', { expressFlash: req.flash('info'), branches, branch, layout: 'layouts/user' });
  });

// create new branch
  router.post('/', guard.ensureLoggedIn(), async (req, res, next) => {

      const newBranch = await Branch();
      newBranch._storeId = req.session._storeId;
      newBranch.name = req.body.name;
      newBranch.email = req.body.email;
      newBranch.phone = req.body.phone;
      newBranch.address = req.body.address;
      newBranch.country = req.body.country;
      newBranch.state = req.body.state;
      newBranch.city = req.body.city;
      newBranch.status = 1;
      newBranch.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          req.flash('info', 'Branch Saved Successfully');
          res.redirect('/branch');
        }
      });

      // const response = {
      //   status: 200,
      //   message: 'Branch save successfully',
      // };

      // res.send(response);
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
      } else {
        req.flash('info', 'Branch Update Saved Successfully');
        res.redirect('/branch');
      }
    });
  });


  // branch homepage
  router.get('/view/:_branchId', guard.ensureLoggedIn(), async (req, res, next) => {
    const branch = await Branch.findById(req.params._branchId);
    const roles = await Role.find({ _storeId: req.session._storeId });
    const staff = await Account.find({ _storeId: req.session._storeId, _branchId: branch._id }).populate('_roleId');
    res.render('branch/branchDashboard', { staff, roles, branch, expressFlash: req.flash('success'), layout: 'layouts/user' });
  });

    
    // delete branch
router.post('/delete', guard.ensureLoggedIn(), async (req, res) => {

  const id = req.body.id;
  await Branch.findById(id).remove();
  res.send('success');


  // const response = {
  //   status: 200,
  //   message: 'Branch delete successfully',
  // };

  // res.send(response);
});


// add new member
router.post('/member/:_branchId', guard.ensureLoggedIn(), async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    const store = await Store.findById(req.session._storeId);

    const branchId = req.params._branchId;

    if (!store)
      return res.status(400).json({ message: 'Store doesn\'t exist!' });
    const passport = files.passport;
    const member = fields;
    const password = member.password;
    delete member.password;
    const name = `${Math.round(Math.random() * 10000)}.${passport.name.split('.').pop()}`;
    const dest = path.join(__dirname, '..', 'public', 'images', 'member', name);
    member._storeId = store._id;
    member._branchId = branchId;
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
                               if (req.user._roleId === 'admin') {
                                res.redirect('/admin/staff/');
                               } else if (req.user._roleId === 'staff') {
                                res.redirect(`/branch/view/${ branchId}`);
                               }
                              //  res.redirect(`/branch/view/${ branchId}`);
                             }
                           });
                       }
                     });
                   });
    });
  });

});


router.post('/ban', guard.ensureLoggedIn(), async (req, res) => {

  const id = req.body.id;
  const user = await Account.findById(id);

  if (user.status === false){
    user.status = 1;
    user.save(function(err) {
      if (err){
        console.log(err);
      } else {
        res.send('success');
      };
    });
  } else {
    user.status = 0;
    user.save(function(err) {
      if (err){
        console.log(err);
      } else {
        res.send('success');
      };
    });
  }

  // const response = {
  //   status: 200,
  //   message: 'Branch delete successfully',
  // };

  // res.send(response);
});


// branch homepage
router.get('/user/view/:_userId', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.params._userId).populate('_roleId');
  const roles = await Role.find({ _storeId: req.session._storeId });
  const branch = await Branch.findById(user._branchId);
  res.render('branch/viewMember', { user, roles, branch, users: req.user, expressFlash: req.flash('success'), layout: 'layouts/user' });
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
    const name = `${Math.round(Math.random() * 10000)}.${passport.name.split('.').pop()}`;
    const dest = path.join(__dirname, '..', 'public', 'images', 'member', name);
    fs.readFile(passport.path, function(err, data) {
      fs.writeFile(dest,
                   data, function(err) {
                     fs.unlink(passport.path, function(err) {
                       if (err) {
                         res.status(500);
                         res.json(err);
                       } else {
                         member.passport = name;
                         console.log(member);
                         getmember.update(member, function(err) {
                          if (err) {
                            console.log(err);
                          } else {
                            req.flash('success', `${getmember.firstname} update successfully`);
                            res.redirect(`/branch/user/view/${getmember._id}`);
                          }
                        });
                       }
                     });
                   });
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


export default router;
