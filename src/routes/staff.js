import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import Branch from '../models/branch';
import Account from '../models/account';
import Role from '../models/role';
import Category from '../models/category';
import Product from '../models/product';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';


const router = express.Router();


const generateUniqueID = async storeShort => {
    const MEMBER_ID = storeShort + Math.round(Math.random() * 100000);
    const exists = await Account.count({ username: MEMBER_ID });
    while (exists > 0) generateUniqueID(storeShort);
    return MEMBER_ID;
  };


router.get('/dashboard/:_storeId/:_branchId', guard.ensureLoggedIn(), async (req, res, next) => {
    const user = await Account.findById(req.user._id).populate('_roleId');
    const suppliers = await Account.find({ _storeId: req.user._storeId, _supllyId: 'supplier' });
    const categories = await Category.find({ _storeId: req.session._storeId });
    const branches = await Branch.find({ _storeId: req.session._storeId });
    res.render('staff/dashboard', { user, expressFlash: req.flash('info'), suppliers, branches, categories, layout: 'layouts/user' });
});



export default router;