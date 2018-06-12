import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Account from '../models/account';
import Bussiness from '../models/bussiness';
const router = express.Router();


router.get('/', (req, res) => {
  res.render('site/index', { msg: req.flash('info'), layout: 'layouts/site' });
});


router.get('/about', (req, res) => {
  res.render('site/about', { layout: 'layouts/site' });
});


router.get('/register', async (req, res) => {
  const bussiness = await Bussiness.find();
  res.render('site/register', { bussiness, expressFlash: req.flash('info'), layout: 'layouts/site' });
});


router.get('/login', (req, res) => {
  res.render('store/login', { expressFlash: req.flash('success'), user: req.user,
                            error: req.flash('error'),
                            layout: false });
});

// router.get('/login', (req, res) => {
//   res.render('site/index', { user: req.user,
//                              error: req.flash('error'),
//                              layout: 'layouts/site' });
// });


router.post('/login', passport.authenticate('local',
                                            { failureRedirect: '/login',
                                              failureFlash: true }),
            async (req, res, next) => {
              const store = await Store.findById(req.user._storeId);
              const user = await Account.findById(req.user);

              // check if user is ban
              if (user.status === false) {
                req.flash('success', 'You Are on Suspension');
                res.redirect('/');
              } else {
                if (!store) res.redirect('/');
                req.session._storeId = store._id;
                req.session.save((err) => {
                  if (err) {
                    return next(err);
                  }
                  res.redirect('/admin/dashboard');
                });
              }
            });



/*
router.post('/register', (req, res, next) => {
  Account.register(new Account({ username: req.body.username }),
                   req.body.password, (err, account) => {
                     if (err) {
                       return res.render('register', { error: err.message });
                     }
                     passport.authenticate('local')(req, res, () => {
                       req.session.save((err) => {
                         if (err) {
                           return next(err);
                         }
                         res.redirect('/');
                       });
                     });
                   });
});
*/

// router.get('/login', (req, res) => {
//   res.render('store/login', { user: req.user,
//                               error: req.flash('error') });
// });

// router.get('/login', (req, res) => {
//   res.render('site/index', { /* layout: 'layout', */user: req.user,
//                                                     error: req.flash('error'),
//                                                     layout: 'layouts/site' });
// });


// router.post('/login', passport.authenticate('local',
//                                             { failureRedirect: '/login',
//                                               failureFlash: true }),
//             (req, res, next) => {
//               req.session.save((err) => {
//                 if (err) {
//                   return next(err);
//                 }
//                 res.redirect('/admin/dashboard');
//               });
//             });


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
