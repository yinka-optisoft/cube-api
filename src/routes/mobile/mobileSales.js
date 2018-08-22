import express from 'express';
import Store from '../../models/store';
import Account from '../../models/account';
import Branch from '../../models/branch';
import Product from '../../models/product';
import BranchProduct from '../../models/branchProduct';
import ProductMoveProcess from '../../models/productTransfer';
import Sales from '../../models/sales';
import Role from '../../models/role';
import Handlebars from 'handlebars';
import htmlPdf from 'html-pdf';
import fs from 'fs';
Handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));

var jwt = require('jsonwebtoken');
var verifyToken = require('../../helpers/verifyToken');
var multer = require('multer');
var path = require('path');
var imageName;
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'src/public/images/member');
  },
  filename: function(req, file, cb) {
    imageName = Date.now() + path.extname(file.originalname);
    cb(null, imageName); // Appending extension
  }
});

var upload = multer({ storage: storage });

const router = express.Router();


router.post('/addSales', verifyToken, async (req, res) => {
  try {
    const invoiceDetails = req.body.invoiceDetails;
    const customerId = req.body.customerId;
    const productBought = req.body.productBought;
    const date = req.body.date;
    const salesDetails = req.body.salesDetails;

    const newSales = await new Sales();
    newSales.invoiceNumber = invoiceDetails.invoiceNumber;
    newSales.waybillNumber = invoiceDetails.wayBillNumber;
    newSales.invoiceDate = date;
    newSales.discount = salesDetails.discount;
    newSales.balanceTransaction = salesDetails.balance;
    newSales.amountDue = salesDetails.amountDue;
    newSales.amountPaid = salesDetails.amountPaid;
    newSales._salesBy = req.user._id;
    newSales._branchId = req.user._branchId;
    newSales._storeId = req.user._storeId;
    newSales._customerId = customerId;

    await newSales.save(function(err) {
      if (err) {
        console.log(err);
        return res.json({ error: 'An error occured, pease try again later' });
      }
      const findId = Sales.findOne({ _id: newSales._id }, async (err, doc) => {
        console.log(productBought.length);

        for (let i = 0; i < productBought.length; i++) {

          // console.log(productBought[i]._productDetail._productId._id);
          doc._productId.push(productBought[i]._productDetail._productId._id);
          // console.log( productBought[i]._productDetail._productId._id);
          doc.piecesSold.push(productBought[i].piecesDetails.piecesSold);
          // console.log(productBought[i].piecesDetails.piecesSold);
          doc.unitPrice.push(productBought[i].piecesDetails.unitPrice);
          // console.log(productBought[i].piecesDetails.unitPrice)
          doc.totalPrice.push(productBought[i].piecesDetails.priceSold);
          // console.log(productBought[i].piecesDetails.priceSold);
          const deductProduct = await BranchProduct.findOne({ _productId: productBought[i]._productDetail._productId._id, _branchId: req.user._branchId });
          deductProduct.pieces -= productBought[i].piecesDetails.piecesSold;
          deductProduct.save((err) => {
            if (err) {
              console.log(err);
            }
          });
        }
        doc.save(function(err) {
          if (err) {
            console.log(err);
          }
          return res.json({ success: 'Sales has been added' });
        });
      });
    });

  } catch (e) {
    console.log(e);
  }
});
router.get('/fetchSales', verifyToken, async (req, res) => {
  console.log(req.user._branchId);
  const allSales = await Sales.find({ _storeId: req.user._storeId, _branchId: req.user._branchId })
    .populate('_branchId').populate('_productId').populate('_userId');
  console.log(allSales);
  return res.json({ sales: allSales });
});


router.get('/fetchRole', verifyToken, async (req, res) => {

  const allRoles = await Role.find({ _storeId: req.user._storeId });
  const Branches = await Branch.find({ _storeId: req.user._storeId });
  return res.json({ roles: allRoles, branches: Branches });
});

router.post('/storeRole', verifyToken, async (req, res) => {
  const addRole = await new Role();
  addRole._userId = req.user._id;
  addRole._storeId = req.user._storeId;
  addRole.description = req.body.description;
  addRole.name = req.body.role;
  addRole.roleType = req.body.roleType;
  await addRole.save(function(err) {
    if (err) {
      return res.json({ error: 'An error occured, please try again later' });
    }
    console.log(addRole);
    return res.json({ success: 'Role has been added' });
  });
});

const generateUniqueID = async storeShort => {
  const ADMIN_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: ADMIN_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return ADMIN_ID;
};

router.post('/addUser', verifyToken, upload.single('avatar'), async (req, res) => {
  const findShortCode = await Store.findOne({ _id: req.user._storeId });
  const newAdmin = req.body;
  const password = newAdmin.password;
  delete newAdmin.password;
  newAdmin.roleId = 'admin';
  newAdmin._storeId = req.user._storeId;
  newAdmin._branchId = req.user._branchId;
  newAdmin.username = await generateUniqueID(findShortCode.shortCode);
  newAdmin.firstname = req.body.firstName;
  newAdmin.middlename = req.body.middleName;
  newAdmin.lastname = req.body.lastName;
  newAdmin.address = req.body.address;
  newAdmin.passport = imageName;
  newAdmin.phone = req.body.phoneNumber;
  newAdmin.email = req.body.emailAddress;
  newAdmin._roleId = req.body.role;
  Account.register(new Account(newAdmin), password,
                   (err, account) => {
                     const accountId = String(account._id);
                     console.log(accountId);
                     // Account.findByIdAndUpdate(account._id, { token: jwt.sign(accountId, 'cube7000Activated')});
                     Account.findById(account._id, function(err, doc) {
                       console.log(doc);
                       if (err) {
                         console.log(err);
                       }
                       doc.token = jwt.sign({ id: doc._id }, 'cube7000Activated');
                       doc.save(function(err) {
                         if (err) {
                           console.log(err);
                         }
                       });

                       return res.send({ success: 'User has been created' });
                     });
                   });
});

router.get('/fetchUser', verifyToken, async (req, res) => {

  // const storeUsers = await Account.find({ _storeId: req.user._storeId }).populate('_branchId');

  /*  await Account.find({
        $and: [  { $or: [{ _storeId: req.user._storeId }] },
            { $or: [{ _id: { $ne: req.user._id } } ] }
        ]).populate('_brachId');
*/

  const storeUsers = await Account.find({
    $and: [
      { $or: [{ _storeId: req.user._storeId }] },
      { $or: [{ _id: { $ne: req.user._id } } ] }
    ]
  }).populate('_branchId');
  const branches = await Branch.find({ _storeId: req.user._storeId });
  console.log(storeUsers);
  return res.json({ users: storeUsers, branches: branches });
});


router.post('/moveToBranch', verifyToken, async (req, res) => {
  const findMover = await Account.findOne({ _id: req.body.userId });
  const initialBranch = findMover._branchId;
  const newBranch = req.body.newBranch;
  if (String(initialBranch) === String(newBranch)) {

    return res.json({ msg: 'Cant move user to the same branch', head: 'Notice' });
  }

  findMover._branchId = newBranch;
  await findMover.save(function(err) {
    if (err) return res.json({ msg: 'An error occured please try again later', head: 'Error' });


    return res.json({ msg: 'User has been moved to branch', head: 'Success' });
  });

});

router.post('/moveProductToBranch', verifyToken, async (req, res) => {

  if (String(req.body.newBranchId) == String(req.body.fromBranch)) {
    return res.json({ msg: 'Cant move product to the same branch', head: 'Error' });
  }
  const productId = req.body.productId;
  const piecesAdded = parseFloat(req.body.pieces);
  const newBranch = req.body.newBranchId;
  let findProduct = await BranchProduct.findOne({ _storeId: req.user._storeId, _productId: productId, _branchId: newBranch });
  const findMover = await BranchProduct.findOne({ _storeId: req.user._storeId, _productId: productId, _branchId: req.body.fromBranch });

  // const initialBranch = findProduct._id;

  if (findProduct) {
    const piecesAvailable = parseFloat(findProduct.pieces);
    findProduct.pieces = piecesAvailable + piecesAdded;
    findProduct.updatedAt = new Date();
    findProduct._branchId = newBranch;

  } else {

    findProduct = await new BranchProduct();
    findProduct._storeId = req.user._storeId;
    findProduct._branchId = newBranch;
    findProduct._productId = productId;
    findProduct.pieces = piecesAdded;
  }
  await findProduct.save(async (err) => {
    if (err) return res.json({ msg: 'An error occured please try again later', head: 'Error' });
    const producttransfer = await new ProductMoveProcess({
      _storeId: req.user._storeId,
      _productId: findProduct._productId,
      _fromId: findMover._branchId,
      _toId: newBranch,
      _productId: findProduct._id,
      pieces:  piecesAdded,
    });
    findMover.pieces = parseFloat(findMover.pieces) - piecesAdded;
    findMover.updatedAt = new Date();
    await producttransfer.save();
    await findMover.save(function(err) {
      if (err) {
        return res.json({ msg: 'An error occured', head: 'Error' });
      }
    });
    return res.json({ msg: 'Product has been moved to branch', head: 'Success' });
  });

});
router.post('/findcode', verifyToken, async (req, res) => {
  const qrCode = req.body.qrcode;
  const findProduct = await Product.findOne({ barcodeNumber: qrCode, _storeId: req.user._storeId });

  if (!findProduct) {
    return res.json({ title: 'Not found', success: 'Product not found in store' });
  }
  const findBarcode = await BranchProduct.findOne({ _productId: findProduct._id }).populate({
    path: '_productId',
    populate: {
      path: '_categoryId',
      model: 'categories'
    }
  }).populate('_branchId');
  console.log(findBarcode);
  if (findBarcode) {
    console.log(findBarcode);
    return res.json({ title: 'Success', success: 'Product found', barcodeResult: findBarcode });
  }

  return res.json({ title: 'Not found', success: 'Product not found in branch' });
});


router.get('/showreceipt/:salesId', async (req, res, next) => {

  const saleId = req.params.salesId;
  console.log(saleId);
  const sale = await Sales.findById(saleId)
                              .populate('_customerId').populate('_productId');
  const store = await Store.findOne({ _id: sale._storeId });


  console.log(sale);
  const salesObj = [];
  for (let i = 0; i < sale._productId.length; i++) {
    salesObj.push(sale._productId[i].productName);
  }

  const html = fs.readFile(path.join(__dirname, '..', '..', 'views', 'pdf', 'invoice.html'),
                           { encoding: 'utf8' },
                           (err, data) => {
                             if (!err) {
                               Sales.findById(
                                 saleId
                               ).populate('_customerId').populate('_productId')
                              .exec((err, sales) => {
                                if (!err) {
                                  let html = Handlebars.compile(data)({
                                    sales,
                                    sale,
                                    store,
                                    salesObj
                                  });

                                  html = html.replace('storelogo',
                                                      path.join('file://',
                                                                __dirname, '..',
                                                                'public',
                                                                'images',
                                                                'store',
                                                                store.logo
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

export default router;
