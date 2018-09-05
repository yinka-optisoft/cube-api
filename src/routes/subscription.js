import express from 'express';
import Store from '../models/store';
import Branch from '../models/branch';
import Account from '../models/account';
import Package from '../models/package';
import License from '../models/license';
import guard from 'connect-ensure-login';


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
    packag.monthlyDuration = req.body.monthlyDuration;
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


router.post('/license', guard.ensureLoggedIn(), async (req, res, next) => {

  const license = new License();
  license._packageId = req.body.id;
  license._createdBy = req.user._id;
  license.used = 'UNUSED';
  license.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.send('success');
    }
  });
});


export default router;
