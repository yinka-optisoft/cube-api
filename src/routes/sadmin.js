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

router.get('/dashboard', async (req, res) => {
  const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');
  res.render('superadmin/dashboard', { user, layout: 'layouts/user' });
});


export default router;
