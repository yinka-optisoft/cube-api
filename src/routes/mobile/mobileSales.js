import express from 'express';
import Store from '../../models/store';
import Account from '../../models/account';
import Branch from '../../models/branch';
import Product from '../../models/product';
import BranchProduct from '../../models/branchProduct';
import ProductMoveProcess from '../../models/productTransfer';
import Sales from '../../models/sales';
import Role from '../../models/role';
import Customer from '../../models/customer';
import Handlebars from 'handlebars';
import htmlPdf from 'html-pdf';
import fs from 'fs';
// import Fawn from 'fawn';


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
    console.log(imageName);
    cb(null, imageName); // Appending extension
  }
});

var upload = multer({ storage: storage });

const router = express.Router();

async function checkCustomerInDb(oldId) {

}

router.post('/addSales', verifyToken, async (req, res, next) => {

  try {
    const invoiceDetails = req.body.invoiceDetails;
    const productBought = req.body.productBought;
    const date = req.body.date;
    const salesDetails = req.body.salesDetails;
    const customer = req.body.customerId;
    const paidBy = req.body.paidBy;

    // TODO: i need to work on subtotal product
    // console.log(productBought, 'productBought');
    // console.log(salesDetails, 'salesDetails');

    const newSales = await new Sales();

    // get customer or create new
    const getCust = await Customer.findOne({
      _branchId: req.user._branchId, _storeId: req.user._storeId, phone: customer.phone
    });
    if (getCust) {
      newSales._customerId = getCust._id;
    } else {
      const newCust = new Customer();
      newCust._storeId = req.user._storeId;
      newCust._branchId = req.user._branchId;
      newCust._createdBy = req.user._id;
      newCust.name = customer.name;
      newCust.phone = customer.phone;
      newCust.email = customer.email;
      newCust.address = customer.address;
      newCust.save();
      newSales._customerId = newCust._id;
    }

    newSales.invoiceNumber = invoiceDetails.invoiceNumber;
    newSales.waybillNumber = invoiceDetails.wayBillNumber;
    newSales.invoiceDate = date;
    newSales.discount = salesDetails.discount;
    newSales.balanceTransaction = salesDetails.balance;
    newSales.amountDue = salesDetails.amountDue;
    newSales.amountPaid = salesDetails.amountPaid;
    newSales.totalPrice = salesDetails.sumAmount;
    newSales._salesBy = req.user._id;
    newSales._branchId = req.user._branchId;
    newSales._storeId = req.user._storeId;
    newSales.paidBy = paidBy;

    await newSales.save(function(err) {
      if (err) {
        console.log(err);
        return res.json({ error: 'An error occured, pease try again later' });
      }
      const findId = Sales.findById(newSales._id, async (err, doc) => {

        for (let i = 0; i < productBought.length; i++) {

          // console.log(productBought[i]._productDetail._productId._id);
          doc._productId.push(productBought[i]._productDetail._productId._id);
          // console.log( productBought[i]._productDetail._productId._id);
          doc.piecesSold.push(productBought[i].piecesDetails.piecesSold);
          // console.log(productBought[i].piecesDetails.piecesSold);
          doc.unitPrice.push(productBought[i].piecesDetails.unitPrice);
          // console.log(productBought[i].piecesDetails.unitPrice)
          // doc.totalPrice.push(productBought[i].piecesDetails.totalPrice);
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

    res.status(500).end();
  }
});

router.get('/fetchSales', verifyToken, async (req, res) => {
  let pagiSales;
  const page = parseInt(req.headers.page);
  const total = parseInt(req.headers.total);
  // const allSales = await Sales.fxnd({ _storeId: req.user._storeId, _branchId: req.user._branchId })
  //   .populate('_branchId').populate('_productId').populate('_userId').sort({ 'createdAt': -1 }); ;
  console.log('hey');
  pagiSales = await Sales.paginate({ _storeId: req.user._storeId, _branchId: req.user._branchId },
                                   { offset: page, limit: 10, populate: ['_branchId', '_userId', '_salesBy', '_productId'] });

  console.log('aFTER');
  // console.log(req.headers.page);

  // if (total > pagiSales.total && page == parseInt(pagiSales.page)) {

  //   pagiSales = await Sales.paginate({ _storeId: req.user._storeId, _branchId: req.user._branchId },
  //                                    { offset: total, limit: 10, populate: ['_branchId', '_userId', '_salesBy', '_productId'] });

  //   return res.json({ sales: pagiSales });
  // }

  return res.json({ sales: pagiSales });
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
  var branchId;
  if (req.body._branchId) {

    branchId = req.body._branchId;
  } else {

    branchId = req.user._branchId;
  }

  if (imageName == undefined) {
    imageName = 'defaultUser.png';
  }
  const findShortCode = await Account.findOne({ username: req.body.username });
  const emailCheck = await Account.findOne({ email: req.body.emailAddress });
  if (findShortCode) {
    return res.json({ success: 'Username already exist', head: 'exist' });
  }

  if (emailCheck) {
    return res.json({ success: 'Email already exist', head: 'exist' });
  }
  const newAdmin = req.body;
  const password = newAdmin.password;
  delete newAdmin.password;

  if (req.body.privilege == 'true') {

    newAdmin.roleId = 'admin';
  } else {
    newAdmin._roleId = req.body.role;
  }
  newAdmin._storeId = req.user._storeId;
  newAdmin._branchId = branchId;
  newAdmin.username = req.body.username;
  newAdmin.firstname = req.body.firstName;
  newAdmin.lastname = req.body.lastName;
  newAdmin.address = req.body.address;
  newAdmin.passport = imageName;
  newAdmin.phone = req.body.phoneNumber;
  newAdmin.email = req.body.emailAddress;

  Account.register(new Account(newAdmin), password,
                   async (err, account) => {
                     const accountId = String(account._id);
                     console.log(accountId);
                     // Account.findByIdAndUpdate(account._id, { token: jwt.sign(accountId, 'cube7000Activated')});
                     Account.findById(accountId, async function(err, doc) {
                       const tokenG = await Account.findById(account._id);
                       tokenG.token = await jwt.sign({ id: account._id }, 'cube7000Activated');
                       await tokenG.save(function(err) {
                         if (err) {
                           console.log(err);
                         }
                       });
                       // });
                       if (err) {
                         console.log(err);
                       } else {
                         console.log('success');
                         return res.json({ success: 'User has been created', head: 'success' });
                       }
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
      { $or: [{ _id: { $ne: req.user._id } }] }
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
      pieces: piecesAdded,
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
  const findBarcode = await BranchProduct.findOne({ _productId: findProduct._id, _branchId: req.user._branchId }).populate({
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


router.post('/edit', verifyToken, upload.single('avatar'), async (req, res) => {
  const findUser = await Account.findOne({ _id: req.user._id });

  if (imageName !== undefined) {

    imageName = 'defaultUser.png';
  }

  findUser.firstname = req.body.firstname;
  findUser.lastname = req.body.lastname;
  findUser.address = req.body.address;
  findUser.phone = req.body.phone;
  findUser.passport = imageName;
  console.log(imageName);

  await findUser.save((err) => {
    if (err) {
      console.log(err);
    }
  });
  console.log(findUser);
  return res.json({ success: 'User has been updated', user: findUser });
});


router.get('/showreceipt/:salesId', async (req, res, next) => {
  const saleId = await Sales.findById(req.params.salesId);
  const sale = await Sales.findById(saleId)
                          .populate('_productId')
                          .populate('_customerId')
                          .populate('_salesBy');

  const fullname = sale._customerId.name;
  const name = fullname.split(' ');
  const firstname = name[0];
  const lastname = name[1] ? fullname.substr(fullname.indexOf(' ') + 1) : '';

  const store = await Store.findById(sale._storeId);
  const salesObj = [];
  for (let i = 0; i < sale._productId.length; i++) {
    const productId = sale._productId[i];
    const qty = sale.piecesSold[i];
    const unitPrice = sale.unitPrice[i];
    const subTotal = (unitPrice * qty);
    const findProduct = await Product.findOne({ _id: productId });
    salesObj.push({ productName: findProduct.productName, qty: qty, unitPrice: unitPrice, subTotal: subTotal });
  }

  const html = fs.readFile(path.join(__dirname, '..', '..', 'views', 'pdf', 'invoice.html'),
                           { encoding: 'utf8' },
                           (err, data) => {
                             if (!err) {

                               Sales.findById(
                                 saleId._id
                               ).populate('_customerId').populate('_productId').populate('_salesBy')
          .exec((err, sales) => {
            if (!err) {
              const html = Handlebars.compile(data)({
                sales,
                sale,
                fullname,
                store,
                salesObj,
              });


              try {
                // html = html.replace('storelogo',
                //                   path.join('file://',
                //                             __dirname, '..',
                //                             'public',
                //                             'images',
                //                             'store',
                //                             store.logo
                //                   ));
              } catch (err) {
                console.log('There was an error: ', err);

              }


              htmlPdf.create(html, {
                format: 'A4',
                orientation: 'portrait',
                border: '10mm'
              }).toStream((err, stream) => {
                if (!err) {
                  res.setHeader('Content-type', 'application/pdf');
                  stream.pipe(res);
                }
              });

              console.log('Yay!!!');


            }
          });
                             }
                           });


});


router.post('/editBranch', verifyToken, async (req, res) => {
  const findBranch = await Branch.findOne({ _id: req.body._id });

  findBranch.name = req.body.name;
  findBranch.email = req.body.email;
  findBranch.address = req.body.address;
  findBranch.city = req.body.city;
  findBranch.state = req.body.state;
  findBranch.phone = req.body.phone;
  findBranch.country = req.body.country;
  await findBranch.save(function(err) {
    if (err) {
      console.log(err);
    }
  });
  console.log(findBranch);
  return res.json({ success: 'Branch has been updated', title: 'success' });
});

router.get('/fetchBranchDetails', verifyToken, upload.single('avatar'), async (req, res) => {
  const branchId = req.headers._branchid;
  console.log(req.headers);
  const findBranch = await Branch.findOne({ _id: branchId });
  const todaysDate = new Date().toISOString().split('T')[0];
  const todaySales = await Sales.find({
    $and: [
      { $and: [{ _storeId: req.user._storeId }, { _branchId: branchId }] },
      { $and: [{ createdAt: { $gt: new Date(todaysDate) } }] }
    ]
  }).count();
  const sumVal = await Sales.aggregate([
    { $match: { createdAt: { $gt: new Date(todaysDate) }, _branchId: branchId } },
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
  for (let i = 0; i < sumVal.length; i++) {
    totalPrice += sumVal[i].totalPrice;
  }

  const findUsers = await Account.find({ _branchId: branchId }).count();
  const branchInfo = { users: findUsers, totalPrice: totalPrice, sales: todaySales };
  return res.json({ branchInfo });
});

router.post('/changeStatus', verifyToken, async (req, res) => {
  const findBranch = await Branch.findOne({ _id: req.body.id });
  findBranch.status = !findBranch.status;
  await findBranch.save(function(err) {
    if (err) {
      return res.json({ error: 'An error occured' });
    }

    return res.json({ success: 'Status has been changed' });
  });

});
router.post('/blockUser', verifyToken, async (req, res) => {
  const findUser = await Account.findOne({ _id: req.body.userId });

  findUser.status = !findUser.status;
  await findUser.save(function(err) {
    if (err) {
      return res.json({ error: 'An error occured' });
    }

    console.log(findUser.status);
    return res.json({ success: 'Status has been changed', status: findUser.status });
  });
});

async function createNewCustomer(oldCustomer, callback) {
  let newCustomer = await Customer.find({ email: oldCustomer.email });
  if (!newCustomer) {
    newCustomer = await new Customer();
    newCustomer.name = oldCustomer.name;
    newCustomer.email = oldCustomer.email;
    newCustomer.phone = oldCustomer.phone;
    newCustomer._storeId = oldCustomer._storeId;
    newCustomer._branchId = oldCustomer._branchId;
    newCustomer._createdBy = oldCustomer._createdBy;
    newCustomer.createdAt = oldCustomer.createdAt;
    newCustomer.save((err, newCus) => {
      if (err) console.log(err);
      if (newCus) callback(newCus);
    });
  } else {
    callback(newCustomer);
  }
}

router.post('/submitPending', verifyToken, async (req, res) => {
  // var task = Fawn.Task();
  const details = req.body.findSale;
  const submittedIds = [];
  // const enterEmpty = await new Sales();
  // await enterEmpty.save();

  const newSales = await new Sales();


  for (let i = 0; i < details.length; i++) {
    const checkOfflineId = await Sales.findOne({
      offlineId: details[i]._id, _branchId: req.user._branchId, _storeId: req.user._storeId,
      _salesBy: req.user._id
    });
    if (checkOfflineId) {
      submittedIds.push(details[i]._id);
      continue;
    }

    // check customer if exist
    const getCust = await Customer.findOne({
      _branchId: req.user._branchId, _storeId: req.user._storeId, phone: details[i]._customerId.phone
    });
    if (getCust) {
      newSales._customerId = getCust._id;
    } else {
      const newCust = new Customer();
      newCust._storeId = req.user._storeId;
      newCust._branchId = req.user._branchId;
      newCust._createdBy = req.user._id;
      newCust.name = details[i]._customerId.name;
      newCust.phone = details[i]._customerId.phone;
      newCust.email = details[i]._customerId.email;
      newCust.address = details[i]._customerId.address;
      newCust.save();
      newSales._customerId = newCust._id;
    }

    newSales.invoiceNumber = details[i].invoiceNumber;
    newSales.waybillNumber = details[i].wayBillNumber;
    newSales.paidBy = details[i].paidBy;
    newSales.invoiceDate = details[i].invoiceDate;
    newSales.discount = details[i].discount;
    newSales.balanceTransaction = details[i].balanceTransaction;
    newSales.amountDue = details[i].amountDue;
    newSales.amountPaid = details[i].amountPaid;
    newSales._salesBy = req.user._id;
    newSales._branchId = req.user._branchId;
    newSales._storeId = req.user._storeId;
    newSales.offlineId = details[i]._id;


    submittedIds.push(details[i]._id);
    // fawnSale._customerId = customerId;
    for (let k = 0; k < details[i]._productId.length; k++) {

      // console.log(productBought[i]._productDetail._productId._id);
      newSales._productId.push(details[i]._productId[k]._id);
      // console.log( productBought[i]._productDetail._productId._id);
      newSales.piecesSold.push(details[i].pieces[k]);
      // console.log(details[i].pieces[k]);
      newSales.unitPrice.push(details[i].unitPrice[k]);
      // console.log(details[i].unitPrice[k])
      newSales.totalPrice.push(details[i].totalPrice[k]);
      // console.log(productBought[i].piecesDetails.priceSold);
      const deductProduct = await BranchProduct.findOne({ _productId: details[i]._productId[k]._id, _branchId: req.user._branchId });
      // const newdeductProduct = deductProduct.toObject();
      deductProduct.pieces -= details[i].pieces[k];
      deductProduct.save((err) => {
        if (err) {
          console.log(err);
        }
      });
    }


    await newSales.save(function(err) {
      if (err) {
        console.log(err);
      }
    });

  }

  return res.json({ head: 'success', data: submittedIds });
});
export default router;
