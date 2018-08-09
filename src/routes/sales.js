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
import Customer from '../models/customer';
import BranchProduct from '../models/branchProduct';
import Sales from '../models/sales';

const router = express.Router();


router.get('/create/sales', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId');
  const customers = await Customer.find({ _storeId: req.user._storeId, _branchId: req.user._branchId });
  const products = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).populate('_productId');
  res.render('sales/createSales', { user, expressFlash: req.flash('info'), customers, products, layout: 'layouts/user' });
});

router.post('/get/pieces', guard.ensureLoggedIn(), async (req, res, next) => {
  const product = await BranchProduct.findOne({ _productId: req.body._productId, _branchId: req.user._branchId }).populate('_productId');
  return res.json(product);
});


router.get('/manage/sales', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId');
  const suppliers = await Account.find({ _storeId: req.user._storeId, _supllyId: 'supplier' });
  const categories = await Category.find({ _storeId: req.session._storeId });
  const branches = await Branch.find({ _storeId: req.session._storeId });
  res.render('sales/manageSales', { user, expressFlash: req.flash('info'), suppliers, branches, categories, layout: 'layouts/user' });
});


router.post('/create/customer', guard.ensureLoggedIn(), async (req, res, next) => {

  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const address = req.body.address;


  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('phone', 'Phone is required').notEmpty();
  req.checkBody('address', 'Address is required').notEmpty();
  req.checkBody('email', 'E-mail', 'E-mail is required').isEmail();

  var errors = req.validationErrors();

  console.log(errors);

  if (errors) {
    req.session.errors = errors;
    res.redirect('/sales/create/sales');
  } else {

    const customer = await Customer(req.body);
    customer._storeId = req.user._storeId;
    customer._branchId = req.user._branchId;
    customer._createdBy = req.user._id;
    customer.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('info', 'Customer Created');
        res.redirect('/sales/create/sales');
      }
    });
  }

});


router.post('/create/sale', guard.ensureLoggedIn(), async (req, res, next) => {

  console.log(req.body);

  const amtDueToCus = req.body.amtDueToCus;
  const payByCus = req.body.payByCus;
  //   const totalPrice = req.body.totalPrice;
  const invoiceDate = req.body.invoiceDate;
  const invoiceNumber = req.body.invoiceNumber;
  const waybillNumber = req.body.waybillNumber;
  const customerId = req.body.customerId;

  // let productId = req.body._productId;
  // let piecesSold = req.body.piecesSold;
  // let productPrice = req.body.productPrice;


  req.checkBody('amtDueToCus', 'Amount Due To Customer is required').notEmpty();
  req.checkBody('payByCus', 'Pay By Customer is required').notEmpty();
  //   req.checkBody('totalPrice', 'Total Price is required').notEmpty();
  req.checkBody('invoiceDate', 'Invoice Date is required').notEmpty();
  req.checkBody('invoiceNumber', 'Invoice Number is required').notEmpty();
  req.checkBody('waybillNumber', 'Way Bill Number is required').notEmpty();
  req.checkBody('customerId', 'Select Customer name').notEmpty();
  // req.checkBody('_productId', 'Product is required').notEmpty();
  // req.checkBody('piecesSold', 'Pieces is required').notEmpty();
  // req.checkBody('productPrice', 'Price is required').notEmpty();

  var errors = req.validationErrors();

  console.log(errors);

  if (errors) {
    req.session.errors = errors;
    res.redirect('/sales/create/sales');
  } else {

    const sale = new Sales();
    sale._storeId = req.user._storeId;
    sale._branchId = req.user._branchId;
    sale._salesBy = req.user._id;
    sale._customerId = req.body.customerId;
    sale.invoiceDate = req.body.invoiceDate;
    sale.invoiceNumber = req.body.invoiceNumber;
    sale.waybillNumber = req.body.waybillNumber;
    sale.amountDue = req.body.amountDue;
    sale.amountPaid = req.body.amountPaid;
    sale.balanceTransaction = req.body.balanceTransaction; // TODO: come back to this naming convention
    sale.discount = req.body.discount;

    for (let i = 0; i < req.body.salesArray.length; i++) {
      sale._productId.push(req.body.salesArray[i]._productId);
      sale.piecesSold.push(req.body.salesArray[i].piecesSold);
      sale.unitPrice.push(req.body.salesArray[i].productPrice);


      const deductProduct = await BranchProduct.findOne({ _productId: req.body.salesArray[i]._productId, _branchId: req.user._branchId });
      deductProduct.pieces -= req.body.salesArray[i].piecesSold;
      deductProduct.save((err) => {
        if (err) {
          console.log(err);
        }
      });
    }

    await sale.save((err) => {
      if (err) {
        console.log(err);
      }
    });

    return res.json(sale);
  }
});


router.post('/get/sale', guard.ensureLoggedIn(), async (req, res, next) => {

  const productId = req.body._productId;
  const piecesSold = req.body.piecesSold;
  const productPrice = req.body.productPrice;


  req.checkBody('_productId', 'Product is required').notEmpty();
  req.checkBody('piecesSold', 'Pieces is required').notEmpty();
  req.checkBody('productPrice', 'Price is required').notEmpty();

  var errors = req.validationErrors();

  console.log(errors);

  if (errors) {
    req.session.errors = errors;
    res.redirect('/sales/create/sales');
  } else {

    const product = await Sales.find({ _productId: req.body._productId, _branchId: req.user._branchId })
                                      .populate('_categoryId').populate('_productId');

    const sale = new Sales(req.body);
    sale._storeId = req.user._storeId;
    sale._branchId = req.user._branchId;
    sale._salesBy = req.user._id;
    sale._branchproductId = product._id;
    // sale.piecesSold = req.body.piecesSold;
    // sale.productPrice = req.body.productPrice;
    await sale.save((err) => {
      if (err) {
        console.log(err);
      }
    });


    const sales = await Sales.findOne({ _storeId: req.user._storeId, _branchId: req.user._branchId, _branchproductId: sale._branchproductId })
                                                    .populate(
                                                      { path: '_branchproductId',
                                                        populate: { path: '_productId' } });

    console.log(sales);

    return res.json(sales);
  }
});

export default router;
