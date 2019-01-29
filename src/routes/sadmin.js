import express from 'express';
import Account from '../models/account';
import passport from 'passport';
import Store from '../models/store';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';

const router = express.Router();

router.get('/dashboard', guard.ensureLoggedIn(), async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  res.render('superadmin/dashboard', { user, layout: 'layouts/user' });
});


router.post('/', guard.ensureLoggedIn(), async (req, res) => {
  const sadmin = req.body;
  sadmin.roleId = 'sadmin';
  sadmin.username = req.body.email;
  Account.register(
    new Account(sadmin), 'password', (err, account) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/store/roles');
      }
    });
});


export default router;
