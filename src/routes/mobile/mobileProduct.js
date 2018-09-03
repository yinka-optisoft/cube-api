// var express = require('express');
// var passport = require('passport');
import express from 'express';
import Branch from '../../models/branch';
import Product from '../../models/product';
import BranchProduct from '../../models/branchProduct';
import Category from '../../models/category';
import ProductTransfer from '../../models/productTransfer';
import mongoose from 'mongoose';
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

router.post('/editProduct', verifyToken, async (req, res) => {
  const findProduct = await Product.findOne({ _id: req.body._id });

  console.log(req.body.productCategory);

  if (String(req.body.productCategory._id) !== String(findProduct._categoryId)) {
    const id = mongoose.Types.ObjectId(req.body.productCategory._id);
    findProduct._categoryId = id;
  }
  findProduct.productName = req.body.productName;
  findProduct.sellingPrice = req.body.sellingPrice;
  findProduct.expiryDate = req.body.expiryDate;
  findProduct.barcodeNumber = req.body.barcodeNumber;
  findProduct.reorderLevel = req.body.reorderLevel;
  findProduct.note = req.body.note;
  findProduct.lastUpdatedDate = new Date();
  findProduct._updatedby = req.user._id;
  await findProduct.save(function(err) {
    if (err) {
      console.log(err);
    }
  });
  console.log(findProduct);
  return res.json({ success: 'Product has been updated', title: 'success' });
});


router.post('/restockProduct', verifyToken, async (req, res) => {

  const pieces = parseFloat(req.body.newPieces);
  const findProduct = await BranchProduct.findOne({ _id: req.body._id });

  findProduct.pieces += pieces;
  await findProduct.save(function(err) {
    if (err) {
      return res.json({ head: 'Error', title: 'An error occured, unable to save' });
    }
  });

  const newProduct = await new ProductTransfer();
  newProduct._storeId = req.user._storeId;
  newProduct._productId = req.body._productId;
  newProduct._branchId = findProduct._branchId;
  newProduct._branchProduct = req.body._id;
  newProduct._movedBy = req.user._id;
  newProduct.pieces = pieces;
  newProduct.totalPieces = findProduct.pieces;

  await newProduct.save(function(err) {
    if (err) {
      return res.json({ head: 'Error', title: 'An error occured while submitting, please try again later' });
    }

    return res.json({ head: 'Success', title: 'Products has been restocked' });
  });

});
export default router;
// export default router;
