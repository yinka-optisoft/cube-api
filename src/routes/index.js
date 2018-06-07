import express from 'express';
import passport from 'passport';
import Account from '../models/account';
const router = express.Router();


router.get('/', (req, res) => {
  res.render('site/index', { msg: req.flash('info'), layout: 'layouts/site' });
});


router.get('/about', (req, res) => {
  res.render('site/about', { layout: 'layouts/site' });
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

router.get('/login', (req, res) => {
  res.render('site/index', { /* layout: 'layout', */user: req.user,
                                                    error: req.flash('error'),
                                                    layout: 'layouts/site' });
});

router.post('/login', passport.authenticate('local',
                                            { failureRedirect: '/login',
                                              failureFlash: true }),
            (req, res, next) => {
              req.session.save((err) => {
                if (err) {
                  return next(err);
                }
                res.redirect('/sadmin/dashboard');
              });
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
