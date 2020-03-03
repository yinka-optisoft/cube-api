import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Account from '../models/account';
import Business from '../models/business';
import Subscription from '../models/subscription';
import nodemailer from 'nodemailer';

const { promisify } = require('util');
const crypto = require('crypto');
const randomBytesAsync = promisify(crypto.randomBytes);
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
    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId}`);
  } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Branch') {
    res.redirect(`/branch/admin/dashboard/${user._storeId._id}/${user._branchId}`);
  } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Branch') {
    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId}`);
  }
});


router.get('/', async (req, res) => {
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
  res.render('store/login', {
    expressFlash: req.flash('info'), user: req.user,
    error: req.flash('error'),
    layout: false
  });
});


router.post('/login', passport.authenticate('local',
  {
    failureRedirect: '/login',
    failureFlash: true
  }),
  async (req, res, next) => {
    const store = await Store.findById(req.user._storeId);
    const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
    // if (!store && user.roleId === 'sadmin') res.redirect('/sadmin/dashboard');
    if (user.roleId === 'sadmin') {
      res.redirect('/sadmin/dashboard');
    } else {
      const sub = await Subscription.findOne({
        _storeId: req.user._storeId,
        $and: [{ activateDate: { $lte: new Date() } }, { expiredDate: { $gte: new Date() } }]
      },
        (err, sub) => {

          console.log(sub, 'remainingDays');

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
                    // TODO: come back again for this
                  } else if (user.enterProduct === true) {
                    res.redirect('/product');
                  } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Store') {
                    res.redirect('/admin/dashboard');
                  } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Store') {
                    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId}`);
                  } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Branch') {
                    res.redirect(`/branch/admin/dashboard/${user._storeId._id}/${user._branchId}`);
                  } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Branch') {
                    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId}`);
                  }
                });
              }
            }
          } else {

            // TODO:Come back to this later
            //  sub.expired = true;
            //  sub.save();

            req.flash('success', 'Subscription Expired');
            if (user.roleId === 'admin') {
              res.render('subscription/license', { expressFlash: req.flash('success'), layout: 'layouts/user' });
            }
          }
        });
      if (sub === null) {
        const getExpire = await Subscription.findOne({ _storeId: req.user._storeId });
        getExpire.expired = true;
        getExpire.save((err) => {
          if (err) {
            console.log(err);
          }
        });
        console.log(getExpire);
      }
    }
  });


router.get('/forgot/password', async (req, res) => {
  res.render('store/forgotPassword', { success: req.flash('success'), error: req.flash('error') });
});

router.post('/forgot/password', async (req, res, next) => {

  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/forgot/password');
  }

  const createRandomToken = randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    Account
      .findOne({ email: req.body.email })
      .then((user) => {
        console.log(user, 'user for email');
        if (!user) {
          req.flash('error', 'Account with that email address does not exist.');
          // req.flash('errors', { msg: 'Account with that email address does not exist.' });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });


  const sendForgotPasswordEmail = async (user) => {
    if (!user) return;
    const token = user.passwordResetToken;
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: 'cubeapp700@gmail.com', // generated ethereal user
        pass: 'eoFseg@$$3AT' // generated ethereal password
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'cubeapp700@gmail.com',
      subject: 'Reset your password on Cube',
      text: `You are receiving this email because you ${user.firstname} ${user.lastname} have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/password/reset/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
        // req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            auth: {
              user: 'cubeapp700@gmail.com', // generated ethereal user
              pass: 'eoFseg@$$3AT' // generated ethereal password
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              // req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
              req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
            });
        }
        console.log('ERROR: Could not send forgot password email after security downgrade.\n', err);
        // req.flash('errors', { msg: 'Error sending the password reset message. Please try again shortly.' });
        req.flash('error', 'Error sending the password reset message. Please try again shortly.');
        return err;
      });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot/password'))
    .catch(next);

});

router.get('/password/reset/:token', async (req, res, next) => {
  const user = await Account.findOne({
    passwordResetToken: req.params.token,
    passwordResetExpires: { $gt: Date.now() }
  }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot/password');
    }
    res.render('store/passwordReset', { token: req.params.token, success: req.flash('success'), error: req.flash('error') });
  });
});

router.post('/password/reset/:token', async (req, res, next) => {
  const { newPassword } = req.body;
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('cpassword', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', 'Password do not match Or must be at least 4 characters long.');
    return res.redirect('back');
  }

  await Account.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }).then((sanitizedUser) => {
    if (!sanitizedUser) return;
    console.log(newPassword, 'newPassword');
    console.log(sanitizedUser, 'sanitizedUser');
    if (sanitizedUser) {
      sanitizedUser.setPassword(req.body.password, () => {
        sanitizedUser.passwordResetToken = undefined;
        sanitizedUser.passwordResetExpires = undefined;
        return sanitizedUser.save().then(() => new Promise((resolve, reject) => {
          req.logIn(sanitizedUser, (err) => {
            if (err) return reject(err);
            resolve(sanitizedUser);
          });
        }));
      });
    }

    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: 'cubeapp700@gmail.com', // generated ethereal user
        pass: 'eoFseg@$$3AT' // generated ethereal password
      }
    });
    const mailOptions = {
      to: sanitizedUser.email,
      from: 'cubeapp700@gmail.com',
      subject: 'Your Cube password has been changed',
      text: `Hello,\n\nThis is a confirmation that the password for your account ${sanitizedUser.email} has just been changed.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('success', 'Success! Your password has been changed.');
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          // console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            auth: {
              user: 'cubeapp700@gmail.com', // generated ethereal user
              pass: 'eoFseg@$$3AT' // generated ethereal password
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              req.flash('success', 'Success! Your password has been changed.');
            });
        }
        // console.log('ERROR: Could not send password reset confirmation email after security downgrade.\n', err);
        req.flash('error', 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.');
        return err;
      });
  });
  res.redirect('/login');
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
