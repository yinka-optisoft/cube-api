import express from 'express';
import Account from '../models/account';
import Package from '../models/package';
import License from '../models/license';
import guard from 'connect-ensure-login';
import uuid from 'uuid/v1';
import Subscription from '../models/subscription';


const router = express.Router();


router.get('/', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const packages = await Package.find();
  res.render('subscription/index', { user, packages, expressFlash: req.flash('info'), layout: 'layouts/user' });
});


router.get('/packages', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const packages = await Package.find();
  res.render('subscription/package', { user, packages, expressFlash: req.flash('info'), layout: 'layouts/user' });
});


router.post('/package', guard.ensureLoggedIn(), async (req, res, next) => {
  const packag = await Package(req.body);
  packag._createdBy = req.user._id;
  packag.save((err) => {
    if (err) {
      console.log(err);
    } else {
      req.flash('info', 'Package Created');
      res.redirect('/subscription/packages');
    }
  });
});


router.post('/package/update', guard.ensureLoggedIn(), async (req, res, next) => {

  const packag = await Package.findById(req.body._packageId);

  if (packag) {
    packag.category = req.body.category;
    packag.period = req.body.period;
    packag.price = req.body.price;
    packag.numberOfUser = req.body.numberOfUser;
    packag.numberOfAdmin = req.body.numberOfAdmin;
    packag.duration = req.body.duration;
    packag.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('info', 'Package Updated Created');
        res.redirect('/subscription/packages');
      }
    });
  }
});


router.get('/license', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const packages = await Package.find();
  res.render('subscription/license', { user, packages, expressFlash: req.flash('info'), layout: 'layouts/user' });
});


router.get('/generate/license', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const packages = await Package.find();
  res.render('subscription/generate', { user, packages, expressFlash: req.flash('info'), layout: 'layouts/user' });
});


router.get('/manage/license', guard.ensureLoggedIn(), async (req, res, next) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  const licenses = await License.find().populate('_packageId').populate('_createdBy').populate('_storeId');
  res.render('subscription/manageLicense', { user, licenses, expressFlash: req.flash('info'), layout: 'layouts/user' });
});


router.post('/license', guard.ensureLoggedIn(), async (req, res, next) => {

  console.log(req.body.id);

  const license = new License();
  license._packageId = req.body.id;
  license._storeId = req.user._storeId;
  license._createdBy = req.user._id;
  license.key = uuid();
  license.status = 'UNUSED';
  // license.usedDate = Date();
  license.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.send('success');
    }
  });
});


// check for key validation
router.post('/check/license/key', guard.ensureLoggedIn(), async (req, res) => {

  const key = req.body.key;

  const license = await License.findOne({ key: key, status: 'UNUSED' });

  if (license) {
    res.send('success');
  } else {
    res.send('failure');
  }
});


router.post('/activate/license/key', guard.ensureLoggedIn(), async (req, res) => {

  const key = req.body.key;

  const license = await License.findOne({ key: key, status: 'UNUSED' }).populate('_packageId');

  if (license) {
    license.usedDate = Date();
    license.status = 'USED';
    license._usedBy = req.user._storeId;
    license.save((err) => {
      if (err) {
        console.log(err);
      }
    });

    const currentDate = new Date();

    if (license._packageId.period === 'Month' || license._packageId.period === 'Months') {
      const monthlyDuration = license._packageId.duration;
      currentDate.setMonth(currentDate.getMonth() + monthlyDuration);

    } else if (license._packageId.period === 'Year' || license._packageId.period === 'Years') {
      const YearlyDuration = license._packageId.duration;
      currentDate.setFullYear(currentDate.getFullYear() + YearlyDuration);
    }


    const sub = await Subscription();
    sub._storeId = req.user._storeId;
    sub._packageId = license._packageId;
    sub._licenseId = license._id;
    sub._entryBy = req.user._id;
    sub.activateDate = Date();
    sub.expiredDate = currentDate;
    sub.expired = false;
    sub.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash('success', 'You have Successfully Subscribe ');
        res.redirect('/dashboard');
      }
    });

  } else {

    req.flash('info', 'Invalid License Key ');
    res.redirect('/subscription/license');

  }
});


export default router;
