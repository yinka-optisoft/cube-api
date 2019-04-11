import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Role from '../models/role';
import Account from '../models/account';
import Branch from '../models/branch';
import Product from '../models/product';
import Supply from '../models/supply';
import Subscription from '../models/subscription';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';
import jwt from 'jsonwebtoken';
import BranchProduct from '../models/branchProduct';

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
  const sub = await Subscription.findOne({ _storeId: req.user._storeId,
                                           $and: [ { activateDate: { $lte: new Date() } }, { expiredDate: { $gte: new Date() } }] });
  const products = await BranchProduct.find({ _storeId: req.user._storeId, pieces: { $lte: 10 } }).populate('_branchId').populate('_productId');
  res.render('admin/dashboard', { user, branch, product, products, account, suppliers, sub, expressFlash: req.flash('success'),
                                  layout: 'layouts/user' });
});


// manage staff
router.get('/staff', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  const roles = await Role.find({ _storeId: req.user._storeId });
  const admins = await Account.find({ _storeId: req.user._storeId })
                                    .populate('_roleId').populate('_branchId');

  // note that due to check exists query filter the store admin and any other staff that have
  // the same privilege as admin out
  const allStaff = await Account.find({ _storeId: req.user._storeId, _roleId: { $exists: true } })
                                    .populate('_roleId').populate('_branchId');
  const branchStaff = await Account.find({ _storeId: req.user._storeId, _branchId: req.user._branchId,
                                           _roleId: { $exists: true } }).populate('_roleId').populate('_branchId');
  res.render('staff/staff', { user, allStaff, branchStaff, admins, roles, branches, expressFlash: req.flash('success'),
                              layout: 'layouts/user' });
});


// manage staff that enter product
router.get('/staff/enter/product', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branch = await Branch.findOne({ _storeId: req.user._storeId, headBranch: true });
  const roles = await Role.find({ _storeId: req.user._storeId });
  const staff = await Account.find({ _storeId: req.user._storeId, _roleId: { $exists: true } })
                                    .populate('_roleId').populate('_branchId');

  const allStaff = await Account.find({ _storeId: req.user._storeId, enterProduct: true })
                                    .populate('_roleId').populate('_branchId');
  res.render('staff/enterProduct', { user, allStaff, staff, roles, branch, expressFlash: req.flash('success'),
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


router.post('/di-active', guard.ensureLoggedIn(), async (req, res) => {

  const id = req.body.id;
  const user = await Account.findById(id);
  if (user) {
    user.enterProduct = false;
    user.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.send('success');
      };
    });
  }
//   else {
//   user.status = 0;
//   user.save(function(err) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send('success');
//     };
//   });
// }
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

    // get current date
    const currentDate = new Date();

    const numOfUser = await Account.count({ _storeId: req.user._storeId });
    const sub = await Subscription.findOne({ _storeId: req.user._storeId, expiredDate: { $gte: currentDate } })
                                  .populate('_packageId').populate('_licenseId');

    const user = await Account.findOne({ email: fields.email });

    if (sub._licenseId.licenseName === 'Value' || sub._packageId.category === 'Value') {

      if (numOfUser < 3) {

        if (user) {

          req.flash('success', 'E-mail Or Username Already Exist');
          res.redirect('/admin/staff/');

        } else {

          const store = await Store.findById(req.user._storeId);


          if (!store)
            return res.status(400).json({ message: 'Store doesn\'t exist!' });

          const convertToUpper = store.name;
          const storeName = convertToUpper.toUpperCase();
          const storeSub = storeName.substring(0, 3);

          const passport = files.passport;
          const member = fields;
          const password = member.password;
          delete member.password;
          member._storeId = store._id;
          member._branchId = fields._branchId;
          member.status = 1;
          member.phone = `+234${fields.phone}`;
          member.username = `${storeSub}-${fields.username}`;
          member.enterProduct = (fields.enterProduct !== '') ? fields.enterProduct : '';
          if (passport && passport.name) {
            const name = `${Math.round(Math.random() * 10000)}.${passport.name.split('.').pop()}`;
            const dest = path.join(__dirname, '..', 'public', 'images', 'member', name);
            const data = fs.readFileSync(passport.path);
            fs.writeFileSync(dest, data);
            fs.unlinkSync(passport.path);
            member.passport = name;
          }

          Account.register(new Account(member), password,
                           async (err, account) => {

                             // return false;
                             const tokenG = await Account.findOne({ _id: account._id, _storeId: account._storeId });
                             //  console.log(tokenG);
                             tokenG.token = await jwt.sign({ id: account._id }, 'cube7000Activated');
                             await tokenG.save(function(err) {
                               if (err) {
                                 console.log(err);
                               }
                               //  console.log(tokenG);
                             });

                             if (err) {
                               console.log(err);
                             } else if (account.roleId === 'admin') {
                               req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                               res.redirect('/admin/admins');
                             } else {
                               req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                               res.redirect('/admin/staff');
                             }
                           });

        }
      } else {

        req.flash('success', 'Sorry You Can\'t Register More Than 3 Users On This Package');
        res.redirect('/admin/staff');
      }

    } else if (sub._licenseId.licenseName === 'Enterprise' || sub._packageId.category === 'Enterprise') {

      if (numOfUser < 10) {

        if (user) {

          req.flash('success', 'E-mail Or Username Already Exist');
          res.redirect('/admin/staff/');

        } else {

          const store = await Store.findById(req.user._storeId);


          if (!store)
            return res.status(400).json({ message: 'Store doesn\'t exist!' });

          const convertToUpper = store.name;
          const storeName = convertToUpper.toUpperCase();
          const storeSub = storeName.substring(0, 3);

          const passport = files.passport;
          const member = fields;
          const password = member.password;
          delete member.password;
          member._storeId = store._id;
          member._branchId = fields._branchId;
          member.status = 1;
          member.username = `${storeSub}-${fields.username}`;
          member.phone = `+234${fields.phone}`;
          member.enterProduct = (fields.enterProduct !== '') ? fields.enterProduct : '';
          if (passport && passport.name) {
            const name = `${Math.round(Math.random() * 10000)}.${passport.name.split('.').pop()}`;
            const dest = path.join(__dirname, '..', 'public', 'images', 'member', name);
            const data = fs.readFileSync(passport.path);
            fs.writeFileSync(dest, data);
            fs.unlinkSync(passport.path);
            member.passport = name;
          }
          // console.log(member);
          Account.register(new Account(member), password,
                           async (err, account) => {

                             // return false;
                             const tokenG = await Account.findById(account._id);
                             //  console.log(tokenG);
                             tokenG.token = await jwt.sign({ id: account._id }, 'cube7000Activated');
                             await tokenG.save(function(err) {
                               if (err) {
                                 console.log(err);
                               }
                               //  console.log(tokenG);
                             });

                             if (err) {
                               console.log(err);
                             } else if (account.roleId === 'admin') {
                               req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                               res.redirect('/admin/admins');
                             } else {
                               req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                               res.redirect('/admin/staff');
                             }
                           });

        }
      } else {
        req.flash('success', 'Sorry You Can\'t Register More Than 10 Users On This Package');
        res.redirect('/admin/staff');
      }

    } else if (sub._licenseId.licenseName === 'Diamond' || sub._packageId.category === 'Diamond') {

      if (user) {

        req.flash('success', 'E-mail Or Username Already Exist');
        res.redirect('/admin/staff/');

      } else {

        const store = await Store.findById(req.user._storeId);


        if (!store)
          return res.status(400).json({ message: 'Store doesn\'t exist!' });

        const convertToUpper = store.name;
        const storeName = convertToUpper.toUpperCase();
        const storeSub = storeName.substring(0, 3);

        const passport = files.passport;
        const member = fields;
        const password = member.password;
        delete member.password;
        member._storeId = store._id;
        member._branchId = fields._branchId;
        member.status = 1;
        member.username = `${storeSub}-`.fields.username;
        member.phone = `+234${fields.phone}`;
        member.enterProduct = (fields.enterProduct !== '') ? fields.enterProduct : '';
        if (passport && passport.name) {
          const name = `${Math.round(Math.random() * 10000)}.${passport.name.split('.').pop()}`;
          const dest = path.join(__dirname, '..', 'public', 'images', 'member', name);
          const data = fs.readFileSync(passport.path);
          fs.writeFileSync(dest, data);
          fs.unlinkSync(passport.path);
          member.passport = name;
        }
        // console.log(member);
        Account.register(new Account(member), password,
                         async (err, account) => {

                         // return false;
                           const tokenG = await Account.findById(account._id);
                           //  console.log(tokenG);
                           tokenG.token = await jwt.sign({ id: account._id }, 'cube7000Activated');
                           await tokenG.save(function(err) {
                             if (err) {
                               console.log(err);
                             }
                           //  console.log(tokenG);
                           });

                           if (err) {
                             console.log(err);
                           } else if (account.roleId === 'admin') {
                             req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                             res.redirect('/admin/admins');
                           } else {
                             req.flash('success', `Saved Successfully! Your Username is ${member.username}`);
                             res.redirect('/admin/staff');
                           }
                         });

      }

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


// move user from one store to another
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


// Give Existing Staff Right To Enter Product
router.post('/right/product', guard.ensureLoggedIn(), async (req, res) => {

  const post = await Account.findById(req.body.user);
  post.enterProduct = true;
  post.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', `${post.firstname} ${post.lastname} Given Right To Enter Product`);
      res.redirect('/admin/staff/enter/product');
    };
  });
});

function genInvoiceNumb() {
  var text = '';
  var alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var numb = `0123456789${alph}`;

  for (let i = 0; i < 13; i++)
    text += numb.charAt(Math.floor(Math.random() * numb.length));

  return text;
}

router.post('/gen', guard.ensureLoggedIn(), async (req, res) => {

  const num = req.body.number;
  const genArrays = [];
  const code = genInvoiceNumb();

  for (let i = 0; i < num; i++) {
    genArrays.push({ code: code });
  }

  res.render('barcode/barcode', { genArrays });
});


router.post('/gen/update', guard.ensureLoggedIn(), async (req, res) => {

  const num = req.body.number;
  const barcodNum = req.body.barcode;
  const genArrays = [];

  const barcode = Product.findOne({ _storeId: req.user._storeId, barcodeNumber: barcodNum }, (err, barcode) => {

    if (err) {
      console.log(err);
    } else if (barcode !== null) {

      const code = barcode.barcodeNumber;

      for (let i = 0; i < num; i++) {
        genArrays.push({ code: code });
      }

      res.render('barcode/barcode', { genArrays });

    } else {

      req.flash('success', 'Invalid Barcode');
      res.redirect('/admin/dashboard');
    }
  });
});


export default router;
