import express from 'express';
import Store from '../models/store';
import Account from '../models/account';
import Product from '../models/product';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import Customer from '../models/customer';
import BranchProduct from '../models/branchProduct';
import Sales from '../models/sales';
import Handlebars from 'handlebars';
import htmlPdf from 'html-pdf';
import { Types } from 'mongoose';


Handlebars.registerHelper('math', function(lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    '+': lvalue + rvalue,
    '-': lvalue - rvalue,
    '*': lvalue * rvalue,
    '/': lvalue / rvalue,
    '%': lvalue % rvalue
  }[operator];
});

// helper for date format
Handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));

const router = express.Router();


router.get('/create/sales', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const customers = await Customer.find({ _storeId: req.user._storeId, _branchId: req.user._branchId, show: true });
  const products = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).populate('_productId');
  res.render('sales/createSales', { user, expressFlash: req.flash('info'), customers, products, layout: 'layouts/user' });
});


router.get('/create/sales/pos', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const customers = await Customer.find({ _storeId: req.user._storeId, _branchId: req.user._branchId, show: true });
  const products = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).populate('_productId');
  res.render('sales/posSales', { user, expressFlash: req.flash('info'), customers, products, layout: 'layouts/user' });
});

router.post('/get/pieces', guard.ensureLoggedIn(), async (req, res, next) => {
  const product = await BranchProduct.findOne({ _productId: req.body._productId, _branchId: req.user._branchId }).populate('_productId');
  return res.json(product);
});


router.post('/get/barcodeNumber', guard.ensureLoggedIn(), async (req, res, next) => {
  const pro = await Product.findOne({ barcodeNumber: req.body.barcodeNumber, _storeId: req.user._storeId });

  if (pro !== null) {

    const product = await BranchProduct.findOne({ _productId: pro._id, _branchId: req.user._branchId }, (err, product) => {
      if (err) {
        console.log(err);
        return res.json('failure');
      } else {
        return res.json(product);
      }
    }).populate('_productId');
  } else {
    return res.json('failure');
  }
});


router.get('/manage/sales', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const allSales = await Sales.find({ _salesBy: req.user._id, _storeId: req.user._storeId, _branchId: req.user._branchId }).sort('-createdAt').populate('_productId');
  res.render('sales/manageSales', { user, expressFlash: req.flash('info'), allSales, layout: 'layouts/user' });
});


router.post('/create/customer', guard.ensureLoggedIn(), async (req, res, next) => {

  var errors = req.validationErrors();

  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const address = req.body.address;


  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('phone', 'Phone is required').notEmpty();
  req.checkBody('address', 'Address is required').notEmpty();
  req.checkBody('email', 'E-mail', 'E-mail is required').isEmail();

  console.log(errors);

  if (errors) {
    req.session.errors = errors;
    res.redirect('/sales/create/sales');
  } else {

    const customer = await Customer(req.body);
    customer._storeId = req.user._storeId;
    customer._branchId = req.user._branchId;
    customer._createdBy = req.user._id;
    customer.show = true;
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

  const amtDueToCus = req.body.amtDueToCus;
  const payByCus = req.body.payByCus;
  const totalPrice = req.body.totalPrice;
  const invoiceDate = req.body.invoiceDate;
  const invoiceNumber = req.body.invoiceNumber;
  const waybillNumber = req.body.waybillNumber;
  const customerId = req.body.customerId;

  var errors = req.validationErrors();


  req.checkBody('amtDueToCus', 'Amount Due To Customer is required').notEmpty();
  req.checkBody('payByCus', 'Pay By Customer is required').notEmpty();
  req.checkBody('totalPrice', 'Total Price is required').notEmpty();
  req.checkBody('invoiceDate', 'Invoice Date is required').notEmpty();
  req.checkBody('invoiceNumber', 'Invoice Number is required').notEmpty();
  req.checkBody('waybillNumber', 'Way Bill Number is required').notEmpty();
  // req.checkBody('customerId', 'Select Customer name').notEmpty();


  console.log(errors);

  if (errors) {
    // req.session.errors = errors;
    req.flash('info', 'Error');
    res.redirect('/sales/create/sales');
  } else {

    const sale = new Sales();
    const customer = await Customer.findById(customerId);
    sale._storeId = req.user._storeId;
    sale._branchId = req.user._branchId;
    sale._salesBy = req.user._id;
    sale.subtotal = req.body.subtotal;
    sale.totalPrice = req.body.totalPrice;
    sale._customerId = (req.body.customerId === '') ? Types.ObjectId('5b87a5f019e03f50077a671b') : req.body.customerId;
    sale.invoiceDate = req.body.invoiceDate;
    sale.invoiceNumber = req.body.invoiceNumber;
    sale.waybillNumber = req.body.waybillNumber;
    sale.amountDue = req.body.amtDueToCus;
    sale.amountPaid = req.body.payByCus;
    sale.balanceTransaction = req.body.balanceTransaction;
    sale.discount = req.body.discount;
    sale.paidBy = req.body.paidBy;
    sale.customerName = customer.name;
    sale.customerPhone = customer.phone;
    for (let i = 0; i < req.body.salesArray.length; i++) {
      sale._productId.push(req.body.salesArray[i]._productId);
      sale.piecesSold.push(req.body.salesArray[i].piecesSold);
      sale.unitPrice.push(req.body.salesArray[i].productPrice);

      // deduct the pieces from branch product
      const deductProduct = await BranchProduct.findOne({ _productId: req.body.salesArray[i]._productId, _branchId: req.user._branchId });
      // console.log(deductProduct, 'before deduct');
      deductProduct.pieces -= req.body.salesArray[i].piecesSold;
      deductProduct.save((err) => {
        if (err) {
          console.log(err);
        }
      });

      // console.log(deductProduct, 'after deduct');
    }

    await sale.save((err) => {
      if (err) {
        console.log(err);
      }
    });

    return res.json(sale);
  }
});


router.get('/get/product/:product', guard.ensureLoggedIn(), async (req, res, next) => {

  const productNam = req.params.product;

  const branchProduct = await BranchProduct.find({ _storeId: req.user._storeId, _branchId: req.user._branchId });

  const ProductIds = [];
  for (let i = 0; i < branchProduct.length; i++) {
    ProductIds.push(branchProduct[i]._productId);
  }
  const pro = await Product.find({ _id: { $in:  ProductIds } });
  const final = pro.filter(p => p.productName.toLowerCase().indexOf(productNam.toLowerCase()) > -1);

  return res.json(final);
});


router.get('/get/pdf/:saleId', guard.ensureLoggedIn(), async (req, res, next) => {

  const store = await Store.findById(req.user._storeId);
  const sale = await Sales.findById(req.params.saleId)
                            .populate('_customerId').populate('_productId');

  const fullname = sale._customerId.name;
  const name = fullname.split(' ');
  const firstname = name[0];
  const lastname = name[1] ? fullname.substr(fullname.indexOf(' ') + 1) : '';

  // iterate tru product and send it to salesObject
  const salesObj = [];
  for (let i = 0; i < sale._productId.length; i++) {
    const productId = sale._productId[i];
    const qty = sale.piecesSold[i];
    const unitPrice = sale.unitPrice[i];
    const subTotal = (unitPrice * qty);
    const findProduct = await Product.findOne({ _id: productId });
    salesObj.push({ productName: findProduct.productName, qty: qty, unitPrice: unitPrice, subTotal: subTotal });

  }

  const html = fs.readFile(path.join(__dirname, '..', 'views', 'pdf', 'invoice.html'),
                           { encoding: 'utf8' },
                           (err, data) => {
                             if (!err) {
                               Sales.findById(
                                 req.params.saleId
                               ).populate('_customerId').populate('_productId').populate('_salesBy')
                            .exec((err, sales) => {
                              if (!err) {
                                let html = Handlebars.compile(data)({
                                  sales,
                                  sale,
                                  fullname,
                                  store,
                                  salesObj
                                });

                                html = html.replace('storelogo',
                                                    path.join('file://',
                                                              __dirname, '..',
                                                              'public',
                                                              'images',
                                                              'store',
                                                      // store.logo
                                                    ));

                                htmlPdf.create(html, {
                                  format: 'A4',
                                  orientation: 'portrait',
                                  // border: '2mm'
                                })
                                        .toStream((err, stream) => {
                                          if (!err) {
                                            res.setHeader('Content-type', 'application/pdf');
                                            stream.pipe(res);
                                          }
                                        });
                              }
                            });
                             }
                           });

});


export default router;
