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
    cb(null, 'src/public/images/product/');
  },
  filename: function(req, file, cb) {

    imageName = Date.now() + path.extname(file.originalname);
    cb(null, imageName); // Appending extension
  }
});


var upload = multer({ storage: storage });


const router = express.Router();



router.post('/storeProduct', verifyToken, upload.single('avatar'), async (req, res) => {

  if (imageName == undefined) {
    imageName = 'defaultProduct.png';
  }


  const addProduct = await new Product();
  addProduct._branchId = req.user._branchId;
  addProduct._createdBy = req.user._id;
  addProduct._categoryId = req.body.productcategory;
  addProduct._storeId = req.user._storeId;
  addProduct.productName = req.body.productName;
  addProduct.sellingPrice = req.body.sellingPrice;
  addProduct.reorderLevel = req.body.reorderLevel;
  addProduct.expiryDate = new Date(req.body.expiryDate).toDateString();
  addProduct.pieces = req.body.pieces;
  addProduct.note = req.body.note;
  addProduct.barcodeNumber = req.body.barcodeNumber;
  addProduct.productImage = imageName;
  await addProduct.save(function(err) {
    if (err) {
      console.log(err);
      return res.json({ error: 'An error occured, please try again later' });
    }
    // console.log('saved oo');
    // return res.json({ success: 'product has been added' });
  });

  const addBranchproduct = await new BranchProduct();
  addBranchproduct._branchId = req.body.productBranch;
  addBranchproduct.pieces = req.body.pieces;
  addBranchproduct._productId = addProduct._id;
  addBranchproduct._storeId = req.user._storeId;
  await addBranchproduct.save(function(err) {
    if (err) {
      console.log(err);
      return res.json({ error: 'An error occured, please try again later' });
    }
    return res.json({ success: 'Product has been added' });
  });
});

export default router;
// export default router;
