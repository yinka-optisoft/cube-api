import express from 'express';
import Account from '../models/account';
import Package from '../models/package';
import License from '../models/license';
import guard from 'connect-ensure-login';
import uuid from 'uuid/v1';
import Subscription from '../models/subscription';
import Store from '../models/store';


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

  const { category, period, duration, numberOfShop, numberOfUser } = req.body;

  const packag = new Package();

  if (category === 'Value') {

    packag.price = 'NGN 20,000';
    packag.category = category;
    packag.period = period;
    packag.duration = duration;
    packag.numberOfShop = numberOfShop;
    packag.numberOfUser = numberOfUser;
    packag._createdBy = req.user._id;

  } else if (category === 'Premium') {

    packag.price = 'NGN 50,000';
    packag.category = category;
    packag.period = period;
    packag.duration = duration;
    packag.numberOfShop = numberOfShop;
    packag.numberOfUser = numberOfUser;
    packag._createdBy = req.user._id;

  } else if (category === 'Enterprise') {

    packag.price = 'NGN 100,000';
    packag.category = category;
    packag.period = period;
    packag.duration = duration;
    packag.numberOfShop = numberOfShop;
    packag.numberOfUser = numberOfUser;
    packag._createdBy = req.user._id;

  }

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
    packag.numberOfShop = req.body.numberOfShop;
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


router.post('/delete/package', guard.ensureLoggedIn(), async (req, res, next) => {

  await Package.findByIdAndRemove(req.body.id);
  res.send('success');

});


router.get('/license', guard.ensureLoggedIn(), async (req, res, next) => {
  // const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  // const packages = await Package.find();
  res.render('subscription/license', { expressFlash: req.flash('success'), layout: 'layouts/user' });
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


router.post('/license', async (req, res, next) => {

  console.log(req.body);

  const { licenseName, key, licenseGenBy, userId, id } = req.body;

  const category = await Package.findById(id);

  const license = new License();

  if (licenseName === 'Value') {

    license.key = key;
    license.purchasedBy = userId;
    license.licenseGenBy = licenseGenBy;
    license.licenseName = licenseName;
    license.licensePrice = 'NGN 20,000';
    license.licensePeriod = 'Year';
    license.licenseDuration = 1;

  } else if (licenseName === 'Premium') {

    license.key = key;
    license.purchasedBy = userId;
    license.licenseGenBy = licenseGenBy;
    license.licenseName = licenseName;
    license.licensePeriod = 'Year';
    license.licenseDuration = 1;

  } else if (licenseName === 'Enterprise') {

    license.key = key;
    license.purchasedBy = userId;
    license.licenseGenBy = licenseGenBy;
    license.licenseName = licenseName;
    license.licensePrice = 'NGN 100,000';
    license.licensePeriod = 'Year';
    license.licenseDuration = 1;

  } else if (category.category === 'Value') {

    license._packageId = id;
    license._createdBy = req.user._id;
    license.key = uuid();

  } else if (category.category === 'Premium') {

    license._packageId = id;
    license._createdBy = req.user._id;
    license.key = uuid();

  } else if (category.category === 'Enterprise') {

    license._packageId = id;
    license._createdBy = req.user._id;
    license.key = uuid();
  }

  license.status = 'UNUSED';
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

    if (license.licensePeriod === 'Year') {
      const YearlyDuration = license.licenseDuration;
      currentDate.setFullYear(currentDate.getFullYear() + YearlyDuration);

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
        req.flash('info', 'You have Successfully Subscribe Login TO Enjoy Your Store');
        res.redirect('/login');
      }
    });

  } else {

    req.flash('success', 'Invalid License Key ');
    res.redirect('/subscription/license');

  }
});


export default router;
