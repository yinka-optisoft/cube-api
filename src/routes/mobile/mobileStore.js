// var express = require('express');
// var passport = require('passport');
import express from 'express';
import passport from 'passport';
import Store from '../../models/store';
import Account from '../../models/account';
import Branch from '../../models/branch';
import Product from '../../models/product';
import Customers from '../../models/customer';
import BranchProduct from '../../models/branchProduct';
import Category from '../../models/category';
import Business from '../../models/business';
import License from '../../models/license';
import Package from '../../models/package';
import Subscription from '../../models/subscription';
import data from './data';
import multer from 'multer';
import jwt from 'jsonwebtoken';
// var jwt = require('jsonwebtoken');
var verifyToken = require('../../helpers/verifyToken');
// var multer = require('multer');
import path from 'path';
var imageName;

var storage = multer.diskStorage({

  destination: function(req, file, cb) {
    console.log(file);
    cb(null, 'src/public/images/store/');
  },
  filename: function(req, file, cb) {

    imageName = Date.now() + path.extname(file.originalname);
    cb(null, imageName); // Appending extension
  }
});


var upload = multer({ storage: storage });


const router = express.Router();

router.get('/details', verifyToken, async (req, res) => {

  const findStoreDetails = await Store.findById({ _id: req.user._storeId });
  const branchCount = await Branch.find({ _storeId: req.user._storeId }).count();
  const UsersCount = await Account.find({ _storeId: req.user._storeId }).count();
  if (findStoreDetails) {
    console.log(findStoreDetails);
    return res.json({ success: true, userCount: UsersCount, storeDetails: findStoreDetails, branchCount: branchCount });
  } else {
    return res.json({ error: 'Error occured fetching store details' });
  }
});

router.get('/details/staff', verifyToken, async (req, res) => {

  const findStoreDetails = await Branch.findOne({ _id: req.user._branchId });
  const branchCount = await Branch.find({ _storeId: req.user._storeId }).count();
  const UsersCount = await Account.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).count();
  if (findStoreDetails) {
    return res.json({ success: true, userCount: UsersCount, storeDetails: findStoreDetails, branchCount: branchCount });
  } else {
    return res.json({ error: 'Error occured fetching store details' });
  }
});

const generateUniqueID = async storeShort => {
  const ADMIN_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: ADMIN_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return ADMIN_ID;
};


router.post('/create/store', upload.single('avatar'), async (req, res) => {

  console.log(req.body);

  const { store_name, store_email } = req.body;

  const storeNameRex = new RegExp(['^', store_name, '$'].join(''), 'i');
  const storeEmailRex = new RegExp(['^', store_email, '$'].join(''), 'i');

  const convertToUpper = store_name;
  const storeName = convertToUpper.toUpperCase();
  const storeSub = storeName.substring(0, 3);


  if (imageName == undefined) {
    imageName = 'defaultStore.jpg';
  }

  const checkStore = await Store.findOne(
    { name: storeNameRex, email: storeEmailRex, shortCode: storeName }
  );

  if (checkStore) {
    return res.status(404).json({ 'failed': 'Store Name Or Email Already Exist' });

  } else {

    try {
      const newStore = new Store();
      newStore.name = req.body.store_name;
      newStore.email = req.body.store_email;
      newStore.phone = req.body.store_phone;
      newStore.address = req.body.store_address;
      newStore.shortCode = storeName;
      newStore.website = req.body.website;
      newStore.businessType = req.body.businessType;
      newStore.country = req.body.storeCountry;
      newStore.state = req.body.storeState;
      newStore.city = req.body.storeCity;
      newStore.logo = imageName;
      await newStore.save(function(err) {
        if (err) {
          // console.log(err);
        }
      });
      const newBranch = new Branch();
      newBranch._storeId = newStore._id;
      newBranch.name = req.body.store_name;
      newBranch.address = req.body.store_address;
      newBranch.email = req.body.store_email;
      newBranch.phone = req.body.store_phone;
      newBranch.country = req.body.storeCountry;
      newBranch.state = req.body.storeState;
      newBranch.city = req.body.storeCity;
      newBranch.headBranch = true;
      await newBranch.save(function(err) {
        if (err) {
          // console.log(err);
        }
      });

      const newPackage = new Package();
      newPackage.category = 'Value';
      newPackage.period = 'Month';
      newPackage.price = 'FREE';
      newPackage.numberOfUser = 3;
      newPackage.numberOfShop = 1;
      newPackage.duration = 1;
      newPackage.save((err) => {
        if (err) {
          console.log(err);
        }
      });

      const newLicense = new License();
      newLicense._packageId = newPackage._id;
      newLicense.licenseName = 'Value';
      newLicense.save((err) => {
        if (err) {
          console.log(err);
        }
      });

      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + 1);

      const sub = await Subscription();
      sub._packageId = newPackage._id;
      sub._licenseId = newLicense._id;
      sub._storeId = newStore._id;
      sub.activateDate = Date();
      sub.expiredDate = currentDate;
      sub.expired = false;
      sub.save((err) => {
        if (err) {
          console.log(err);
        }
      });

      const newAdmin = req.body;
      const password = newAdmin.password;
      delete newAdmin.password;
      newAdmin.roleId = 'admin';
      newAdmin._storeId = newStore._id;
      newAdmin._branchId = newBranch._id;
      newAdmin.username = await generateUniqueID(storeSub);
      newAdmin.firstname = req.body.firstname;
      newAdmin.middlename = req.body.middlename;
      newAdmin.lastname = req.body.lastname;
      newAdmin.address = req.body.store_addres;
      newAdmin.phone = req.body.store_phone;
      newAdmin.email = req.body.store_email;
      newAdmin.passport = 'defaultUser.png';

      Account.register(new Account(newAdmin), password,
                       async (err, account) => {
                         const tokenG = await Account.findById(account._id);
                         console.log(tokenG);
                         tokenG.token = await jwt.sign({ id: account._id }, 'cube7000Activated');
                         await tokenG.save((err) => {
                           if (err) {
                             console.log(err);
                           }
                           console.log(tokenG);
                         });
                         // });
                         if (err) {
                           console.log(err);
                         } else {
                           console.log('success');
                           return res.json({ 'success': 'Store Created successfully', user: account });
                         }
                       });

    } catch (e) {
      console.log(e);
    }
  }
});

router.get('/getCategories', verifyToken, async (req, res) => {
  const getCategory = await Category.find({ _storeId: req.user._storeId });
  const getBranch = await Branch.find({ _storeId: req.user._storeId });
  console.log(getBranch);
  return res.json({ category: getCategory, branch: getBranch });
});

router.get('/fetchProduct', verifyToken, async (req, res) => {

  let categories = [];
  let branches = [];
  const page = parseInt(req.headers.page);
  const products = await BranchProduct.paginate({ _storeId: req.user._storeId },
                                                {
                                                  offset: page, sort: { createdAt: -1 }, limit: 10, populate: ['_branchId', '_userId', '_salesBy',
                                                                                                               {
                                                                                                                 path: '_productId',
                                                                                                                 populate: {
                                                                                                                   path: '_categoryId',
                                                                                                                   model: 'categories'
                                                                                                                 },
                                                                                                                 model: 'products',
                                                                                                               }]
                                                });


  // const products = await BranchProduct.find({ _storeId: req.user._storeId }).populate('_branchId').populate({
  //   path: '_productId',
  //   populate: {
  //     path: '_categoryId',
  //     model: 'categories'
  //   }
  // }).sort({ 'createdAt': -1 });
  console.log(page);

  if (page == 0) {
    categories = await Category.find({ _storeId: req.user._storeId });
    branches = await Branch.find({ _storeId: req.user._storeId });
  }
  return res.json({ products: products, branches: branches, categories: categories });
});


router.get('/fetchProductStaff', verifyToken, async (req, res) => {
  // const products = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).populate('_branchId').populate('_productId').sort({ 'createdAt': -1 });
  let categories = [];
  let branches = [];
  const page = parseInt(req.headers.page);
  const products = await BranchProduct.paginate({ _storeId: req.user._storeId, _branchId: req.user._branchId },
                                                {
                                                  offset: page, sort: { createdAt: -1 }, limit: 10, populate: ['_branchId', '_userId', '_salesBy',
                                                                                                               {
                                                                                                                 path: '_productId',
                                                                                                                 populate: {
                                                                                                                   path: '_categoryId',
                                                                                                                   model: 'categories'
                                                                                                                 },
                                                                                                                 model: 'products',
                                                                                                               }]
                                                });
  if (page == 0) {
    categories = await Category.find({ _storeId: req.user._storeId });
    branches = await Branch.find({ _storeId: req.user._storeId });
  }
  // const categoriest = await Branch.find({ categories: req.user._storeId });
  return res.json({ products: products, branches: branches, categories: categories });
}); '';
router.post('/storeBranch', verifyToken, async (req, res) => {

  const addBranch = await new Branch();
  addBranch._storeId = req.body._storeId;
  addBranch.name = req.body.branchName;
  addBranch.email = req.body.emailAddress;
  addBranch.phone = req.body.phoneNumber;
  addBranch.address = req.body.address;
  addBranch.country = req.body.country;
  addBranch.state = req.body.state;
  addBranch.city = req.body.city;
  addBranch.headBranch = false;

  await addBranch.save(function(err) {
    if (err) {
      console.log(err);
      return res.json({ error: 'An error occured, please try again later' });
    }
    console.log(addBranch);
    return res.json({ success: 'Branch has been added' });
  });
});

router.get('/fetchBranch', verifyToken, async (req, res) => {

  const products = await Branch.find({ _storeId: req.user._storeId });
  return res.json({ products: products });
});

router.post('/storeCategory', verifyToken, async (req, res) => {
  const addCategory = await new Category();
  addCategory._storeId = req.user._storeId;
  addCategory.description = req.body.description;
  addCategory.name = req.body.category;
  addCategory._userId = req.user._id;
  await addCategory.save(function(err) {
    if (err) {
      console.log(err);
      return res.json({ error: 'An error occured, please try again later' });
    }
    console.log(addCategory);
    return res.json({ success: 'Category has been added' });
  });
});

router.get('/fetchCategory', verifyToken, async (req, res) => {
  const category = await Category.find({ _storeId: req.user._storeId });
  return res.json({ category: category });
});


router.get('/fetchSalesBranch', verifyToken, async (req, res) => {
  const getBranch = await Branch.find({ _storeId: req.user._storeId });
  const getProducts = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).populate('_productId');
  const getCustomers = await Customers.find({ _branchId: req.user._branchId, _storeId: req.user._storeId });

  return res.json({ branch: getBranch, products: getProducts, allCustomers: getCustomers });
});

router.get('/getProductDetails', verifyToken, async (req, res) => {
  const findProduct = await BranchProduct.find({});
});


router.post('/login', function(req, res, next) {
  console.log(req.body.username, req.body.password);
  passport.authenticate('local', function(err, user, info) {
    if (err)
      return res.json({ 'error': 'Invalid login one' });

    if (!user)
      return res.json({ 'error': 'Invalid login two' });
    req.logIn(user, function(err) {
      if (err) {
        console.log(err);
        return res.json({ 'error': 'An error occured' });
      }
      console.log(user);
      return res.json({ message: 'login was successsful', user: user });
      // res.redirect('/');
    });

  })(req, res, next);
});


router.get('/get-product-details', verifyToken, async (req, res, next) => {
  const barcodeNumber = req.headers.barcodenumber;
  const findProduct = await Product.findOne({ barcodeNumber: barcodeNumber, _storeId: req.user._storeId }).populate('_categoryId');

  console.log(findProduct + barcodeNumber);
  if (findProduct) {
    return res.json({ success: 'Product found', products: findProduct });
  }

  return res.json({ notfound: 'Product not found in store', barcodeNumber: barcodeNumber });
});

router.post('/showus', verifyToken, function(req, res, next) {
  console.log('why me', req.body);
  // return res.json({ products:  data });
});

router.get('/fetchbusiness', async (req, res) => {
  const business = await Business.find();
  console.log(business);
  // const newBusiness = await new Business();
  // newBusiness.name = 'Manufacture';
  // await newBusiness.save();
  // console.log(business);
  return res.json({ business: business });
});


router.post('/showus', verifyToken, function(req, res, next) {
  console.log('why me', req.body);
  // return res.json({ products:  data });
});

router.post('/editStore', async (req, res) => {
  const findStore = await Store.findOne({ _id: req.body._id });
  findStore.name = req.body.username;
  findStore.address = req.body.address;
  findStore.email = req.body.email;
  findStore.phone = req.body.phone;
  findStore.state = req.body.state;
  findStore.city = req.body.city;

  await findStore.save((err) => {
    if (err) {
      return res.json({ success: 'An error occured' });
    }

    return res.json({ title: 'success', msg: 'Store has been updated' });
  });

});
export default router;
// export default router;
