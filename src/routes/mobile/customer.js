var express = require('express');
import Customers from '../../models/customer';
import { runInNewContext } from 'vm';
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


router.post('/addCustomer', verifyToken, async (req, res) => {
  console.log('Customer Added');
  const AddCustomer = new Customers();
  AddCustomer.name = req.body.customerName;
  AddCustomer.email = req.body.customerEmail;
  AddCustomer.phone = req.body.phoneNumber;
  AddCustomer.address = req.body.customerAddress;
  AddCustomer._branchId = req.user._branchId;
  AddCustomer._storeId = req.user._storeId;
  AddCustomer._createdBy = req.user._id;

  AddCustomer.save((err, cus) => {
    console.log(cus, 'customer');
    if (err) {
      return res.json({ error: 'Unable to add Customer' });
    }
    return res.json({ success: 'Customer has been added successfully', addCustomer: cus });
  });
});

router.get('/allCustomers', verifyToken, async (req, res) => {
  const customers = await Customers.find();
  res.json(customers);
});
module.exports = router;
// export default router;
