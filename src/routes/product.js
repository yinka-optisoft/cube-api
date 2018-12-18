import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Branch from '../models/branch';
import Account from '../models/account';
import Role from '../models/role';
import Category from '../models/category';
import Product from '../models/product';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';
import Supply from '../models/supply';
import BranchProduct from '../models/branchProduct';
import ProductTransfer from '../models/productTransfer';
import Sales from '../models/sales';
import { Types } from 'mongoose';
import ProductUpdateHistory from '../models/productUpdateHistory';


const router = express.Router();

router.get('/', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const products = await Product.find({ _storeId: req.session._storeId }).populate('_categoryId');
  const categories = await Category.find({ _storeId: req.session._storeId });
  const suppliers = await Supply.find({ _storeId: req.user._storeId, show: true });
  const branches = await Branch.find({ _storeId: req.session._storeId });
  res.render('product/manage', { user, suppliers, expressFlash: req.flash('info'), products, branches, categories, layout: 'layouts/user' });
});


router.get('/view/:productId', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const branchproduct = await BranchProduct.findOne({ _storeId: req.user._storeId, _productId: req.params.productId }).populate('_productId');
  const branchproducts = await BranchProduct.find({ _storeId: req.user._storeId, _productId: branchproduct._productId })
                                            .populate('_productId').populate('_branchId');

  res.render('product/viewProduct', { user, branchproduct, branchproducts, expressFlash: req.flash('info'), layout: 'layouts/user' });
});


// check for barcode number validation
router.post('/check/barcodeNumber', guard.ensureLoggedIn(), async (req, res) => {

  const barcode = req.body.barcodeNumber;

  const barcodeNumber = await Product.findOne({ _storeId: req.user._storeId, barcodeNumber: barcode });

  console.log(barcodeNumber);

  if (barcodeNumber) {
    res.send('success');
  } else {
    res.send('failure');
  }
});


router.post('/', guard.ensureLoggedIn(), async (req, res, next) => {

  var errors = req.validationErrors();

  const productName = req.body.productName;
  const _categoryId = req.body._categoryId;
  // const _supplierId = req.body._supplierId;
  const _branchId = req.body._branchId;
  const pieces = req.body.pieces;
  const sellingPrice = req.body.sellingPrice;
  const note = req.body.note;
  const barcodeNumber = req.body.barcodeNumber;

  req.checkBody('productName', 'Product Name is required').notEmpty();
  req.checkBody('_categoryId', 'Category is required').notEmpty();
  // req.checkBody('_supplierId', 'Supplier is required').notEmpty();
  req.checkBody('_branchId', 'Branch is required').notEmpty();
  req.checkBody('pieces', 'Pieces is required').notEmpty();
  req.checkBody('sellingPrice', 'Selling Price is required').notEmpty();
  req.checkBody('barcodeNumber', 'Barcode Number is required').notEmpty();

  console.log(errors);

  if (errors) {

    // req.session.errors = errors;
    res.redirect('/product');

    // res.render('product/manage', { errors });

  } else {

    const product = await Product(req.body);
    product._storeId = req.user._storeId;
    product._createdBy = req.user._id;
    product._supplierId = (req.body._supplierId !== '') ? req.body._supplierId : Types.ObjectId('5b9facb0a4b3e95860f2ad9f');
    product.save((err, product) => {
      if (err) {
        console.log(err);
      } else {
        const branchproduct = new BranchProduct();
        branchproduct._storeId = req.user._storeId;
        branchproduct._productId = product._id;
        branchproduct._branchId = req.body._branchId;
        branchproduct._movedBy = req.user._id;
        branchproduct.pieces = req.body.pieces;
        branchproduct.save((err) => {
          if (err) {
            console.log(err);

          } else {
            req.flash('info', 'Product Created');
            res.redirect('/product');
          }
        });
      }
    });
  }
});

// update product
router.post('/update', guard.ensureLoggedIn(), async (req, res, next) => {

  var errors = req.validationErrors();

  const product = await Product.findById(req.body._productId);

  const name = req.body.name;
  const _categoryId = req.body._categoryId;
  // const _supplierId = req.body._supplierId;
  const _branchId = req.body._branchId;
  // const pieces = req.body.pieces;
  const sellingPrice = req.body.sellingPrice;
  const note = req.body.note;

  req.checkBody('name', 'Name is required').notEmpty();
  // req.checkBody('_supplierId', 'Supplier is required').notEmpty();
  req.checkBody('_categoryId', 'Category is required').notEmpty();
  req.checkBody('_branchId', 'Branch is required').notEmpty();
  // req.checkBody('pieces', 'Pieces is required').notEmpty();
  req.checkBody('sellingPrice', 'Selling Price is required').notEmpty();

  console.log(errors);

  if (errors) {
    req.flash('info', 'Fill The Form Correctly');
    res.redirect('/product');
  } else {

    product._storeId = req.user._storeId;
    product._supplierId = req.body._supplierId;
    product._categoryId = req.body._categoryId;
    product._branchId = req.body._branchId;
    product.name = req.body.name;
    // product.pieces = req.body.pieces;
    product.sellingPrice = req.body.sellingPrice;
    product.barcodeNumber = req.body.barcode;
    product.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('info', 'Product Updated Successfully');
        res.redirect('/product');
      }
    });

    // TODO: remind me create update product history
  }
});


// add pieces to existing product
router.post('/update/existing/product', guard.ensureLoggedIn(), async (req, res, next) => {

  var errors = req.validationErrors();

  const productId = req.body.productId;
  const pieces = req.body.pieces;
  // const sellingPrice = req.body.sellingPrice;

  req.checkBody('productId', 'Product is required').notEmpty();
  req.checkBody('pieces', 'Pieces is required').notEmpty();
  // req.checkBody('sellingPrice', 'Selling Price is required').notEmpty();

  console.log(errors);

  if (errors == null) {
    // req.session.errors = errors;
    req.flash('info', 'Product and Price is required');
    res.redirect('/product');
  } else {

    const product = await BranchProduct.findOne({ _storeId: req.user._storeId, _branchId: req.user._branchId, _productId: req.body.productId })
                                          .populate('_categoryId').populate('_productId');

    const productHistory = new ProductUpdateHistory();
    productHistory._storeId = req.user._storeId;
    productHistory._branchId = req.user._branchId;
    productHistory._updatedBy = req.user._id;
    productHistory._productId = product._productId;
    productHistory.oldPieces = product.pieces;
    productHistory.newPieces = req.body.pieces;
    productHistory.totalPieces = (parseFloat(product.pieces) + parseFloat(req.body.pieces));
    productHistory.save((err) => {
      if (err) {
        console.log(err);
      }
    });

    product._createdBy = req.user._id;
    product.pieces += parseFloat(req.body.pieces);
    product.save((err) => {
      if (err) {
        console.log(err);
      }
    });

    return res.json(product);

  }
});


router.post('/delete', guard.ensureLoggedIn(), async (req, res) => {

  const id = req.body.id;

  const findSales = await Sales.findOne({ _productId: id });

  if (findSales === null) {
    await Product.findByIdAndRemove(id);
    res.send('success');
  } else {
    req.flash('info', 'There Is Sales Record For This Product You Can\'t Delete This Product');
    res.redirect('/product');
  }
});


router.post('/get/product', guard.ensureLoggedIn(), async (req, res, next) => {
  const products = await BranchProduct.find({ _storeId: req.session._storeId, _branchId: req.body.branchId })
                                          .populate('_categoryId').populate('_productId');
  return res.json(products);
});


router.post('/get/category', guard.ensureLoggedIn(), async (req, res, next) => {
  const category = await Category.findById(req.body.categoryId);
  const products = await Product.find({ _branchId: req.body.branchId, _categoryId: category._id });

  const productArray = [];
  for (let i = 0; i < products.length; i++) {
    const product = await BranchProduct.findOne({ _productId: products[i]._id, _storeId: req.user._storeId, _branchId: req.user._branchId })
                                          .populate('_categoryId').populate('_productId');
    if (product !== null) {
      productArray.push(product);
    }
  }

  return res.json(productArray);
});


router.post('/get/pieces', guard.ensureLoggedIn(), async (req, res, next) => {
  
  const product = await BranchProduct.findOne({ _productId: req.body._productId, _branchId: req.body.branchId })
                                    .populate('_categoryId').populate('_productId');
  return res.json(product);
});


router.post('/move/product', guard.ensureLoggedIn(), async (req, res, next) => {

  const fromId = req.body.fromId;
  const toId = req.body.toId;
  const productId = req.body.productId;
  const pieces = req.body.pieces;

  req.checkBody('fromId', 'Select Branch to send From').notEmpty();
  req.checkBody('toId', 'Select Branch to send To').notEmpty();
  req.checkBody('productId', 'Product is required').notEmpty();
  req.checkBody('pieces', 'Pieces is required').notEmpty();

  var errors = req.validationErrors();

  console.log(errors);

  if (errors) {
    req.session.errors = errors;
    res.redirect('/product');
  } else {

    const productTo = await BranchProduct.findOne({ _storeId: req.user._storeId, _branchId: toId, _productId: productId });

    if (productTo) {

      const productFrom = await BranchProduct.findOne({ _storeId: req.user._storeId, _branchId: fromId, _productId: productId });

      productTo._storeId = req.user._storeId;
      productTo._productId = req.body.productId;
      productTo._movedBy = req.user._id;
      productTo._branchId = req.body.toId;
      productTo.pieces += (parseFloat(req.body.pieces));
      productTo.save((err) => {
        if (err) {
          console.log(err);
        }
      });

      const productRecord = new ProductTransfer();
      productRecord._storeId = req.user._storeId;
      productRecord._productId = req.body.productId;
      productRecord._fromId = req.body.fromId;
      productRecord._toId = req.body.toId;
      productRecord._branchProduct = productTo._id;
      productRecord._movedBy = req.user._id;
      productRecord.pieces = req.body.pieces;
      productRecord.save((err) => {
        if (err) {
          console.log(err);
        }
      });

      productFrom.pieces -= parseFloat(req.body.pieces);
      productFrom.updatedAt = new Date();
      await productFrom.save((err) => {
        if (err) {
          console.log(err);
        } else {
          req.flash('info', 'Product Moved Successfully');
          res.redirect('/product');
        }
      });

    } else {

      const productFrom = await BranchProduct.findOne({ _storeId: req.user._storeId, _branchId: fromId, _productId: productId });

      const newProduct = new BranchProduct();
      newProduct._storeId = req.user._storeId;
      newProduct._productId = req.body.productId;
      newProduct._branchId = req.body.toId;
      newProduct._movedBy = req.user._id;
      newProduct.pieces = req.body.pieces;
      newProduct.save((err) => {
        if (err) {
          console.log(err);
        }

        const productRecord = new ProductTransfer();
        productRecord._storeId = req.user._storeId;
        productRecord._productId = req.body.productId;
        productRecord._fromId = req.body.fromId;
        productRecord._toId = req.body.toId;
        productRecord._branchProduct = newProduct._id;
        productRecord._movedBy = req.user._id;
        productRecord.pieces = req.body.pieces;
        productRecord.save((err) => {
          if (err) {
            console.log(err);
          }
        });
      });

      productFrom.pieces -= parseFloat(req.body.pieces);
      productFrom.updatedAt = new Date();
      await productFrom.save((err) => {
        if (err) {
          console.log(err);
        } else {
          req.flash('info', 'Product Moved Successfully');
          res.redirect('/product');
        }
      });
    }
  }
});


// moved product
router.get('/move', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const records = await ProductTransfer.find({ _storeId: req.user._storeId })
                                            .populate('_movedBy')
                                            .populate('_fromId')
                                            .populate('_toId')
                                            .populate(
                                              { path: '_productId',
                                                populate: { path: '_categoryId' } });

  res.render('product/productMoved', { user, records, expressFlash: req.flash('info'), layout: 'layouts/user' });
});


router.get('/barcode', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');

  res.render('product/barcode', { user, expressFlash: req.flash('info'), layout: 'layouts/user' });
});


export default router;
