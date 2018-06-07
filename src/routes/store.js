import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Branch from '../models/branch';
import Account from '../models/account';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';

const router = express.Router();


router.get('/register', (req, res) => {
  res.render('site/register', { msg: req.flash('info'), layout: 'layouts/site' });
});


const generateUniqueID = async storeShort => {
  const ADMIN_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: ADMIN_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return ADMIN_ID;
};


router.post('/create-store', guard.ensureLoggedIn(), async (req, res, next) => {
    const form = new formidable.IncomingForm();
  
    form.parse(req, async (err, fields, files) => {

      // fields.checkBody('name', 'company name is required').isEmpty();
      // fields.checkBody('email', 'company email is required').isEmail();

        try {
        const newStore = new Store();
        const logo = files.logo;
        newStore.name = fields.name;
        newStore.email = fields.email;
        newStore.phone = fields.phone;
        newStore.shortCode = fields.shortCode;
        newStore.website = fields.website;
        newStore.businessType = fields.businessType;
        newStore.country = fields.country;
        newStore.state = fields.state;
        newStore.city = fields.city;
        if (logo && logo.name) {
            const name = `${Math.round(Math.random() * 10000)}.${logo.name.split('.').pop()}`;
            const dest = path.join(__dirname, '..', 'public', 'images', 'store', name);
        fs.readFile(logo.path, function(err, data) {
          fs.writeFile(dest,
                        data, function(err) {
                          fs.unlink(logo.path, async (err) => {
                            if (err) {
                              res.status(500);
                              res.json(err);
                            } else {
                            newStore.logo = name;
                              await newStore.save(function(err) {
                                if (err) {
                                  console.log(err);
                                } 
                              });
                              const newBranch = new Branch();
                              newBranch._storeId = newStore._id;
                              newBranch.name = fields.branch_name;
                              newBranch.address = fields.branch_address;
                              newBranch.phone = fields.branch_phone;
                              newBranch.country = fields.branch_country;
                              newBranch.state = fields.branch_state;
                              newBranch.city = fields.branch_city;
                              await newBranch.save(function(err) {
                                if (err){
                                   console.log(err);
                                  } 
                                  
                              });

                              const newAdmin = fields;
                              const password = newAdmin.password;
                              delete newAdmin.password;
                              newAdmin.role = 'admin';
                              newAdmin._storeId = newStore._id;
                              newAdmin._branchId = newBranch._id;
                              newAdmin.username = await generateUniqueID(newStore.shortCode);
                              newAdmin.firstname = fields.firstname;
                              newAdmin.middlename = fields.middlename;
                              newAdmin.lastname = fields.lastname;
                              newAdmin.address = fields.admin_address;
                              newAdmin.phone = fields.admin_phone;
                              newAdmin.email = fields.admin_email;
                              Account.register(new Account(newAdmin), password,
                                (err, account) => {
                                  if (err) {
                                    // TODO: change to console later
                                    // console.log(err);
                                    res.status(500);
                                    res.send(err);
                                    return;
                                  } else {
                                    req.flash('info', `Saved Successfully! Your Username is ${student.username}, The student will be visible once admitted!`);
                                    res.redirect('/');
                                  }
                              });
                            }
                          });
                        });
        });
      }
    } catch (e) {
        console.log(e);
    }
    });
  });


router.post('/login',
            passport.authenticate('local', { failureRedirect: '/login',
                                             failureFlash: true }),
            (req, res, next) => {
              console.log(req);
              req.session.save((err) => {
                if (err)
                  return next(err);
                res.redirect('/sadmin/dashboard');
              });
            });


router.get('/logout', guard.ensureLoggedIn(), (req, res, next) => {
  // const user = req.user;

  req.logout();
  req.session.save((err) => {
    if (err) {
      return next(err);
      } else {
        res.redirect('/login'); 
      }
    /*else {
      School.findById(user._schoolId, (err, school) => {

        // send user to the right dashboard base on their role and school
        if (user.role === 'admin') {
          res.redirect('/login');
        } else if (user.role === 'schooladmin') {
          res.redirect(`/${school.shortCode}/login`);
        } else if (user.role === 'staff') {
          res.redirect(`/${school.shortCode}/login`);
        } else if (user.role === 'student') {
          res.redirect(`/${school.shortCode}/login`);
        } else if (user.role === 'parent') {
          res.redirect(`/${school.shortCode}/login`);
        } else { res.redirect('/login'); }

      });

    }*/
  });
});



  // router.post('/login', passport.authenticate('local', { failureRedirect: 'login',
  //                                  failureFlash: true }),
  // async (req, res, next) => {
  //   // const school = await School.findById(req.user._schoolId);
  //   // if (!school) res.redirect('/');
  //   // req.session._schoolId = school._id;
  //   // req.session._currentSession = school._currentSession;
  //   // detect the current term
  //   Term.findOne({ $and: [
  //     { end: { $gte: new Date() } }, { start: { $lte: new Date() } }] }, (err, term) => {
  //     if (!err) {
  //       req.session._currentTerm = term._id;
  //       req.session.save((err) => {
  //         if (err)
  //           return next(err);
  //         res.redirect('/dashboard');
  //       });
  //     } else {
  //       return next(err);
  //     }
  //   });

  // });

export default router;