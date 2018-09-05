var express = require('express');
import Branch from '../../models/branch';
import Product from '../../models/product';
import Sales from '../../models/sales';
import Account from '../../models/account';
import Store from '../../models/store';
import json2csv from 'json2csv';
import fs from 'fs';
import Handlebars from 'handlebars';
import htmlPdf from 'html-pdf';
import mongoose from 'mongoose';
const Json2csvParser = require('json2csv').Parser;
var verifyToken = require('../../helpers/verifyToken');
var multer = require('multer');
var path = require('path');
var imageName;
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function(req, file, cb) {
    imageName = Date.now() + path.extname(file.originalname);
    cb(null, imageName); // Appending extension
  }
});

var upload = multer({ storage: storage });

const router = express.Router();


router.get('/', verifyToken, async (req, res) => {
  const productCount = await Product.find({ _storeId: req.user._storeId }).count();
  const salesCount = await Sales.find({ _storeId: req.user._storeId }).count();
  const branchCount = await Branch.find({ _storeId: req.user._storeId }).count();
  // const todaysSupply = await Branch.find({ _storeId: req.user._storeId }).count();
  const branchSales = await Sales.find({ _branchId: req.user._branchId }).count();

  // const productsSold = await Sales.find({ _branchId: req.user._branchId }).count();
  //  const  = await Br
  const todaysDate = new Date().toISOString().split('T')[0];

  const todaySales = await Sales.find({
    $and: [
      { $and: [{ _storeId: req.user._storeId }, { _branchId: req.user._branchId }] },
      { $and: [{ createdAt: { $gt: new Date(todaysDate) } } ] }
    ]
  }).count();

  const sumVal = await Sales.aggregate([
    { $match: { createdAt: { $gt: new Date(todaysDate) }, _branchId: req.user._branchId } },
    {
      $project: {
        totalPrice: { $sum: '$totalPrice' },
        pieces: { $sum: '$piecesSold' },
        numberOfProduct: { $size: '$_productId' },
        balance: { $sum: '$balanceTransaction' }
        // examTotal: { $sum: [ "$final", "$midterm" ] }
      }
    }
  ]);

  let totalPrice = 0;
  let totalProduct = 0;
  let totalPieces = 0;
  let totalBalance = 0;
  for (let i = 0; i < sumVal.length; i++) {
    totalPrice += sumVal[i].totalPrice;
    totalProduct += sumVal[i].numberOfProduct;
    totalPieces += sumVal[i].pieces;
    totalBalance += sumVal[i].balance;
  }
  const totals = {
    totalPrice: totalPrice,
    totalProduct: totalProduct,
    totalPieces: totalPieces,
    totalBalance: totalBalance,
  };

  const countDetails = {
    productCount: productCount,
    salesCount: salesCount,
    branchCount: branchCount,
    branchSales: branchSales,
    todaySales: todaySales,
    salesDetails: totals
  };

  return res.json({ countDetails: countDetails });
});


router.get('/staff', verifyToken, async (req, res) => {

  const productCount = await Product.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).count();
  const salesCount = await Sales.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).count();
  const branchCount = await Branch.find({ _storeId: req.user._storeId, _branchId: req.user._branchId }).count();
  // const todaysSupply = await Branch.find({ _storeId: req.user._storeId }).count();
  const branchSales = await Branch.find({ _branchId: req.user._branchId }).count();

  // const productsSold = await Sales.find({ _branchId: req.user._branchId }).count();
  //  const  = await Br
  const todaysDate = new Date().toISOString().split('T')[0];

  const todaySales = await Sales.find({
    $and: [
      { $and: [{ _storeId: req.user._storeId }, { _branchId: req.user._branchId }] },
      { $and: [{ createdAt: { $gt: new Date(todaysDate) } } ] }
    ]
  }).count();

  const sumVal = await Sales.aggregate([
    { $match: { createdAt: { $gt: new Date(todaysDate) }, _branchId: req.user._branchId } },
    {
      $project: {
        totalPrice: { $sum: '$totalPrice' },
        pieces: { $sum: '$piecesSold' },
        numberOfProduct: { $size: '$_productId' },
        balance: { $sum: '$balanceTransaction' }
        // examTotal: { $sum: [ "$final", "$midterm" ] }
      }
    }
  ]);

  let totalPrice = 0;
  let totalProduct = 0;
  let totalPieces = 0;
  let totalBalance = 0;
  for (let i = 0; i < sumVal.length; i++) {
    totalPrice += sumVal[i].totalPrice;
    totalProduct += sumVal[i].numberOfProduct;
    totalPieces += sumVal[i].pieces;
    totalBalance += sumVal[i].balance;
  }
  const totals = {
    totalPrice: totalPrice,
    totalProduct: totalProduct,
    totalPieces: totalPieces,
    totalBalance: totalBalance,
  };

  const countDetails = {
    productCount: productCount,
    salesCount: salesCount,
    branchCount: branchCount,
    branchSales: branchSales,
    todaySales: todaySales,
    salesDetails: totals
  };

  console.log(sumVal);

  return res.json({ countDetails: countDetails });
});


router.get('/todaysData', verifyToken, async (req, res) => {
  const todaysDate = new Date().toISOString().split('T')[0];
  const todaySales = await Sales.find({
    $and: [
      { $and: [{ _storeId: req.user._storeId }, { _branchId: req.user._branchId }] },
      { $and: [{ createdAt: { $gt: new Date(todaysDate) } } ] }
    ]
  }).populate('_productId').populate('_branchId').populate('_salesBy').populate('_customerId').sort({ 'createdAt': -1 });

  console.log(todaySales);
  return res.json({ saleDetails: todaySales });
});


router.get('/profile', verifyToken, async (req, res) => {
  const profileInfo = await Account.findOne({ _id: req.user._id });
  console.log(profileInfo);
  return res.json({ success: 'success', profileInfo: profileInfo });
});

router.get('/fetchBranch', verifyToken, async (req, res) => {
  let branches;
  if (req.user.roleId == 'admin') {
    branches = await Branch.find({ _storeId: req.user._storeId });

  } else {
    branches = await Branch.find({ _id: req.user._branchId });
  }
  return res.json({ success: 'success', countDetails: branches });
});

router.post('/fetchreport', verifyToken, async (req, res) => {

  const branchId = mongoose.Types.ObjectId(req.body._branchId);
  const startDate = new Date(req.body.startDate).toISOString().split('T')[0];

  const result = new Date(startDate);
  result.setDate(result.getDate() + 1);
  const finalResult = new Date(result).toISOString().split('T')[0];
  console.log(finalResult);

  let finalResult2;
  if (req.body.endDate !== null) {

    const endDate = new Date(req.body.endDate).toISOString().split('T')[0];
    const result2 = new Date(endDate);
    result2.setDate(result2.getDate() + 2);
    finalResult2 = new Date(result2).toISOString().split('T')[0];

  } else {

    const endDate = new Date(finalResult);
    const result2 = new Date(endDate);
    result2.setDate(result2.getDate() + 1);
    finalResult2 = new Date(result2).toISOString().split('T')[0];

  }

  console.log(finalResult2);
  const totalSales = await Sales.find({
    $and: [ // return
      { createdAt:  { $gte: new Date(finalResult), $lt: new Date(finalResult2) }, _branchId: branchId },
      /*  { $or:
            [
              { walletCreditted: findAgentWallet._id }, { walletDebitted: findAgentWallet._id }
            ] }, */
    ]
  }).count();
  // const totalSales = await Sales.aggregate([
  //   { $match: { createdAt: { $gte: new Date('2018-08-23'), $lt: new Date(finalResult2) }, _branchId: branchId } },
  //   { $group: { _id: null, myCount: { $sum: 1 } } },
  //   { $project: { _id: 0 } }
  // ]);

  const sumVal = await Sales.aggregate([
    // { $match: { $or: [ { score: { $gt: 70, $lt: 90 } }, { views: { $gte: 1000 } } ] } },

    { $match: { $and: [ { _branchId: branchId }, { createdAt: { $gte: new Date(finalResult), $lt: new Date(finalResult2) } } ] } },
    {
      $project: {
        totalPrice: { $sum: '$totalPrice' },
        pieces: { $sum: '$piecesSold' },
        numberOfProduct: { $size: '$_productId' },
        balance: { $sum: '$balanceTransaction' },
        // examTotal: { $sum: [ "$final", "$midterm" ] }
      }
    }
  ]);
  console.log(sumVal);
  console.log(totalSales);

  let totalPrice = 0;
  let totalProduct = 0;
  let totalPieces = 0;
  let totalBalance = 0;
  for (let i = 0; i < sumVal.length; i++) {
    totalPrice += sumVal[i].totalPrice;
    totalProduct += sumVal[i].numberOfProduct;
    totalPieces += sumVal[i].pieces;
    totalBalance += sumVal[i].balance;
  }
  const totals = {
    totalPrice: totalPrice,
    totalProduct: totalProduct,
    totalPieces: totalPieces,
    totalBalance: totalBalance,
    totalSales: totalSales
  };

  return res.json({ reportData: totals, success: 'success' });
  console.log(totals);
});


router.get('/viewReportSales', verifyToken, async (req, res) => {
  let startDate = req.headers.startdate;
  let endDate = req.headers.enddate;
  const _branchId = req.headers._branchid;
  console.log(req.headers);
  const salesArray = [];
  startDate = new Date(req.headers.startdate).toISOString().split('T')[0];

  const result = new Date(req.headers.startdate);
  result.setDate(result.getDate() + 1);
  const finalResult = new Date(result).toISOString().split('T')[0];
  console.log(finalResult);

  let finalResult2;
  if (!endDate) {

    endDate = new Date(req.headers.startdate).toISOString().split('T')[0];
    const result2 = new Date(req.headers.startdate);
    result2.setDate(result2.getDate() + 2);
    finalResult2 = new Date(result2).toISOString().split('T')[0];

  } else {

    endDate = new Date(finalResult);
    const result2 = new Date(req.headers.enddate);
    result2.setDate(result2.getDate() + 1);
    finalResult2 = new Date(result2).toISOString().split('T')[0];

  }


  console.log(finalResult);
  console.log(_branchId);
  const reportSales = await Sales.find({
    $and: [
      { createdAt:  { '$gte': finalResult, '$lt': finalResult2 }, _branchId: _branchId },
    ]
  }).populate({
    path: '_productId',
    populate: {
      path: '_categoryId',
      model: 'categories'
    }
  }).populate('_salesBy');

  console.log(reportSales);

  const fields = ['productName', 'category', 'productPrice',
                  'piecesSold', 'unitPrice', 'totalPrice', 'salesTotal',
                  'waybillNo', 'invoiceDate', 'discount', 'balance',
                  'amountPaid', 'salesBy', 'amountDue', 'overall Total' ];
  for (let i = 0; i < reportSales.length; i++) {

    salesArray.push({
      'waybillNo': reportSales[i].waybillNumber,
      'invoiceDate': reportSales[i].invoicdDate,
      'discount': reportSales[i].discount,
      'balance': reportSales[i].balance,
      'amountPaid': reportSales[i].amountPaid,
      'amountDue': reportSales[i].amountDue,
    });
    for (let u = 0; u < reportSales[i]._productId.length; u++) {
      salesArray.push({
        'productName': reportSales[i]._productId[u].productName,
        'category': reportSales[i]._productId[u]._categoryId.name,
        'productPrice': reportSales[i]._productId[u].sellingPrice,
        'piecesSold': reportSales[i].piecesSold[u],
        'unitPrice': reportSales[i].unitPrice[u],
        'totalPrice': reportSales[i].totalPrice[u],
        'salesTotal': reportSales[i].totalPrice[u],
      });
    }

    salesArray.push({
      'productName': '',
      'category': '',
      'productPrice': '',
      'piecesSold': '',
      'unitPrice': ' ',
      'totalPrice':  ' ',
      'salesTotal': ' ',
      'waybillNo': ' ',
      'invoiceDate': '  ',
      'discount': ' ',
      'balance':  ' ',
      'amountDue': ' ',
      'amountPaid': ' ',
      'salesBy': ' ',
    });
  }

  const json2csvParser = await new Json2csvParser({ fields });
  const csv = await json2csvParser.parse(salesArray);
  fs.unlink(path.join(__dirname, '..', '..', 'public', 'csv', 'report.csv'), function(err) {
    if (err && err.code == 'ENOENT') {
      // file doens't exist
      console.info("File doesn't exist, won't remove it.");
    } else if (err) {
      // other errors, e.g. maybe we don't have enough permission
      console.error('Error occurred while trying to remove file');
      console.log(err);
    } else {
      console.info('removed');
    }
  });
  fs.writeFile(path.join(__dirname, '..', '..', 'public', 'csv', 'report.csv'), csv, 'utf8', function(err) {
    if (err) {
      console.log(`Some error occured - file either not saved or corrupted file saved. ${ err}`);
    } else {
      return res.sendFile(path.join(__dirname, '..', '..', 'public', 'csv', 'report.csv'));
    }
  });
});

router.get('/viewReportSalesPdf', verifyToken, async (req, res) => {


  const salesArray = [];
  const salesHeading = [];
  const _branchId = req.headers._branchid;
  const branchInfo = await Branch.findOne({ _id: _branchId });
  let startDate = req.headers.startdate;
  let endDate = req.headers.enddate;


  startDate = new Date(req.headers.startdate).toISOString().split('T')[0];

  const result = new Date(req.headers.startdate);
  result.setDate(result.getDate() + 1);
  const finalResult = new Date(result).toISOString().split('T')[0];

  let finalResult2;
  if (!endDate) {

    endDate = new Date(req.headers.startdate).toISOString().split('T')[0];
    const result2 = new Date(req.headers.startdate);
    result2.setDate(result2.getDate() + 2);
    finalResult2 = new Date(result2).toISOString().split('T')[0];

  } else {

    endDate = new Date(finalResult);
    const result2 = new Date(req.headers.enddate);
    result2.setDate(result2.getDate() + 1);
    finalResult2 = new Date(result2).toISOString().split('T')[0];

  }

  const reportSales = await Sales.find({
    $and: [
      { createdAt:  { '$gte': finalResult, '$lt': finalResult2 }, _branchId: _branchId },
    ]
  }).populate({
    path: '_productId',
    populate: {
      path: '_categoryId',
      model: 'categories'
    }
  }).populate('_salesBy');
  // console.log(reportSales);
  let totalAmount = 0;
  const fields = ['productName', 'category', 'productPrice',
                  'piecesSold', 'unitPrice', 'totalPrice', 'salesTotal',
                  'waybillNo', 'invoiceDate', 'discount', 'balance',
                  'amountPaid', 'salesBy', 'overall Total' ];
  for (let i = 0; i < reportSales.length; i++) {
    salesHeading.push({
      'waybillNo': reportSales[i].invoiceNumber,
      'invoiceDate': reportSales[i].invoiceDate,
      'discount': reportSales[i].discount,
      'balance':  reportSales[i].balanceTransaction,
      'amountDue': reportSales[i].amountDue,
      'amountPaid': reportSales[i].amountPaid,
      'salesBy': `${reportSales[i]._salesBy.firstname } ${ reportSales[i]._salesBy.firstname}`,
    });
    totalAmount += reportSales[i].amountPaid;
    for (let u = 0; u < reportSales[i]._productId.length; u++) {
      salesArray.push({
        'productName': reportSales[i]._productId[u].productName,
        'category': reportSales[i]._productId[u]._categoryId.name,
        'productPrice': reportSales[i]._productId[u].sellingPrice,
        'piecesSold': reportSales[i].piecesSold[u],
        'unitPrice': reportSales[i].unitPrice[u],
        'totalPrice': reportSales[i].totalPrice[u],
        'salesTotal': reportSales[i].totalPrice[u],
      });
    }

    salesArray.push({
      'productName': '',
      'category': '',
      'productPrice': '',
      'piecesSold': '',
      'unitPrice': ' ',
      'totalPrice':  ' ',
      'salesTotal': ' ',
      'waybillNo': ' ',
      'invoiceDate': '  ',
      'discount': ' ',
      'balance':  ' ',
      'amountDue': ' ',
      'amountPaid': ' ',
      'salesBy': ' ',
    });
  }

  // fs.unlink(path.join(__dirname, '..', '..', 'public', 'csv', 'report.csv'), function(err) {
  //   if (err && err.code == 'ENOENT') {
  //     // file doens't exist
  //     console.info("File doesn't exist, won't remove it.");
  //   } else if (err) {
  //     // other errors, e.g. maybe we don't have enough permission
  //     console.error('Error occurred while trying to remove file');
  //     console.log(err);
  //   } else {
  //     console.info('removed');
  //   }
  // });

  const html = fs.readFile(path.join(__dirname, '..', '..', 'public', 'reportPdf', 'report.html'),
                           { encoding: 'utf8' },
                           (err, data) => {
                             if (!err) {
                               Store.findOne({ _id: req.user._storeId })
     .exec((err, sales) => {
       if (!err) {
         let html = Handlebars.compile(data)({
           sales,
           salesArray,
           totalAmount,
           branchInfo,
           finalResult,
           finalResult2,
         });

         html = html.replace('storelogo',
                             path.join('file://',
                                       __dirname, '..',
                                       'public',
                                       'images',
                                       'store',
                                       sales.logo
                             ));

         htmlPdf.create(html, {
           format: 'A4',
           orientation: 'portrait',
           border: '10mm'
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

module.exports = router;
// export default router;
