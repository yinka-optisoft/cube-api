import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Account from '../models/account';
import Business from '../models/business';
import Subscription from '../models/subscription';
const router = express.Router();


router.get('/dashboard', async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  if (user.roleId === 'admin') {
    res.redirect('/admin/dashboard');
  } else if (user.roleId === 'sadmin') {
    res.redirect('/sadmin/dashboard');
  } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Store') {
    res.redirect('/admin/dashboard');
  } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Store') {
    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId._id}`);
  } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Branch') {
    res.redirect(`/branch/admin/dashboard/${user._storeId._id}/${user._branchId._id}`);
  } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Branch') {
    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId._id}`);
  }
});


router.get('/', (req, res) => {
  res.render('site/index', { msg: req.flash('info'), layout: 'layouts/site' });
});


router.get('/about', (req, res) => {
  res.render('site/about', { layout: 'layouts/site' });
});


router.get('/register', async (req, res) => {
  const business = await Business.find();
  res.render('site/register', { business, expressFlash: req.flash('info'), layout: 'layouts/site' });
});


router.get('/login', (req, res) => {
  res.render('store/login', { expressFlash: req.flash('info'), user: req.user,
                              error: req.flash('error'),
                              layout: false });
});


router.post('/login', passport.authenticate('local',
                                            { failureRedirect: '/login',
                                              failureFlash: true }),
            async (req, res, next) => {
              const store = await Store.findById(req.user._storeId);
              const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
              // if (!store && user.roleId === 'sadmin') res.redirect('/sadmin/dashboard');
              if (user.roleId === 'sadmin') {
                res.redirect('/sadmin/dashboard');
              } else {
                const sub = await Subscription.findOne({ _storeId: req.user._storeId,
                                                         $and: [ { activateDate: { $lte: new Date() } }, { expiredDate: { $gte: new Date() } }] },
                                                       (err, sub) => {

                                                         if (sub) {

                                                           const presentDate = new Date();
                                                           const expiredDate = sub.expiredDate;

                                                           const remainingDays = Math.round(Math.abs((expiredDate - presentDate) / (1000 * 60 * 60 * 24)));
                                                           console.log(remainingDays, 'remainingDays');

                                                           if (remainingDays > 0) {

                                                             // check if user is ban
                                                             if (user.status === false) {
                                                               req.flash('success', 'You Are Not Activated');
                                                               res.redirect('/login');
                                                             } else {
                                                               if (!store && user.roleId === 'sadmin') res.redirect('/sadmin/dashboard');

                                                               if (!store) res.redirect('/login');
                                                               req.session._storeId = store._id;
                                                               req.session.save((err) => {
                                                                 if (err) {
                                                                   return next(err);
                                                                 }

                                                                 if (user.roleId === 'admin') {
                                                                   res.redirect('/admin/dashboard');
                                                                 } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Store') {
                                                                   res.redirect('/admin/dashboard');
                                                                 } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Store') {
                                                                   res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId._id}`);
                                                                 } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Branch') {
                                                                   res.redirect(`/branch/admin/dashboard/${user._storeId._id}/${user._branchId._id}`);
                                                                 } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Branch') {
                                                                   res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId._id}`);
                                                                 }
                                                               });
                                                             }
                                                           }
                                                         } else {

                                                           sub.expired = true;
                                                           sub.save();

                                                           req.flash('success', 'Subscription Expired');
                                                           //  res.redirect('/login');
                                                           if (user.roleId === 'admin') {
                                                             res.redirect('/admin/dashboard');
                                                           }
                                                         }
                                                       });
              }
            });


router.get('/logout', (req, res, next) => {
  req.logout();
  req.session.save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});


router.get('/ping', (req, res) => {
  res.status(200).send('pong!');
});

export default router;
