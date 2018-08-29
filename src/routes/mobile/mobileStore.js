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
    return res.json({ success: true, userCount: UsersCount, storeDetails:  findStoreDetails, branchCount: branchCount });
  } else {
    return res.json({ error:  'Error occured fetching store details' });
  }
});

router.get('/details/staff', verifyToken, async (req, res) => {

  const findStoreDetails = await Branch.findOne({ _id: req.user._branchId });
  const branchCount = await Branch.find({ _storeId: req.user._storeId }).count();
  const UsersCount = await Account.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).count();
  if (findStoreDetails) {
    console.log(findStoreDetails);
    return res.json({ success: true, userCount: UsersCount, storeDetails:  findStoreDetails, branchCount: branchCount });
  } else {
    return res.json({ error:  'Error occured fetching store details' });
  }
});

const generateUniqueID = async storeShort => {
  const ADMIN_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: ADMIN_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return ADMIN_ID;
};


router.post('/create/store', upload.single('avatar'), async (req, res) => {

  if (imageName == undefined) {
    imageName = 'defaultStore.jpg';
  }
  var str = req.body.store_email;
  var nameMatch = str.match(/^([^@]*)@/);
  var shortCode = nameMatch ? nameMatch[1] : null;

  try {
    const newStore = new Store();
    newStore.name = req.body.store_name;
    newStore.email = req.body.store_email;
    newStore.phone = req.body.store_phone;
    newStore.address = req.body.store_address;
    newStore.shortCode = shortCode;
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
    await newBranch.save(function(err) {
      if (err) {
        // console.log(err);
      }
    });

    const newAdmin = req.body;
    const password = newAdmin.password;
    delete newAdmin.password;
    newAdmin.roleId = 'admin';
    newAdmin._storeId = newStore._id;
    newAdmin._branchId = newBranch._id;
    newAdmin.username = await generateUniqueID(newStore.shortCode);
    newAdmin.firstname = req.body.firstname;
    newAdmin.middlename = req.body.middlename;
    newAdmin.lastname = req.body.lastname;
    newAdmin.address = req.body.store_addres;
    newAdmin.phone = req.body.store_phone;
    newAdmin.email = req.body.store_email;

    Account.register(new Account(newAdmin), password,
                     async (err, account) => {
                       console.log(account._id);
                       const tokenG = await Account.findById(account._id);
                       console.log(tokenG);
                       tokenG.token = await jwt.sign({ id: account._id }, 'cube7000Activated');
                       await tokenG.save(function(err) {
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
});

router.get('/getCategories', verifyToken, async (req, res) => {
  const getCategory = await Category.find({ _storeId: req.user._storeId });
  const getBranch = await Branch.find({ _storeId: req.user._storeId });
  console.log(getBranch);
  return res.json({ category: getCategory, branch: getBranch });
});

router.get('/fetchProduct', verifyToken, async (req, res) => {
  const products = await BranchProduct.find({ _storeId: req.user._storeId }).populate('_branchId').populate('_productId').sort({ 'createdAt': -1 });
  const categories = await Category.find({ _storeId: req.user._id });
  const branches = await Branch.find({ _storeId: req.user._storeId });
  return res.json({ products: products, branches: branches, categories: categories });
});


router.get('/fetchProductStaff', verifyToken, async (req, res) => {
  const products = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).populate('_branchId').populate('_productId').sort({ 'createdAt': -1 });
  const categories = await Category.find({ _storeId: req.user._id });
  const branches = await Branch.find({ _storeId: req.user._storeId });
 // const categoriest = await Branch.find({ categories: req.user._storeId });
  return res.json({ products: products, branches: branches, categories: categories });
});
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
  const findProduct = await BranchProduct.find({ });
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

  return res.json({ notfound:  'Product not found in store', barcodeNumber: barcodeNumber });
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
export default router;
// export default router;
