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


router.get('/', guard.ensureLoggedIn(), async (req, res, next) => {
    const suppliers = await Account.find({ _storeId: req.user._storeId, _supllyId: 'supplier' });
    const categories = await Category.find({ _storeId: req.session._storeId });
    const branches = await Branch.find({ _storeId: req.session._storeId });
    res.render('supply/manage', { expressFlash: req.flash('info'), suppliers, branches, categories, layout: 'layouts/user' });
});


router.post('/', guard.ensureLoggedIn(), async (req, res, next) => {

    const store = await Store.findById(req.user._storeId);

    let firstname = req.body.firstname;
    let middlename = req.body.middlename;
    let lastname = req.body.lastname;
    let phone = req.body.phone;
    let email = req.body.email;
    let address = req.body.address;
    

    req.checkBody('firstname', 'First name is required').notEmpty();
    req.checkBody('lastname', 'Last name is required').notEmpty();
    req.checkBody('phone', 'Phone is required').notEmpty();
    req.checkBody('address', 'Address is required').notEmpty();
    req.checkBody('email', 'E-mail', 'E-mail is required').isEmail();
    
    var errors = req.validationErrors();

    console.log(errors);

    if(errors){
        req.session.errors = errors;
        res.redirect('/supplier');
    } else {
        const supplier = await Account(req.body);
        supplier._storeId = req.user._storeId;
        supplier.username = await generateUniqueID(store.shortCode);
        supplier._supllyId = 'supplier';
        
        Account.register(
            new Account(supplier), 'password', (err, account) => {
            if (err) {
                console.log(err);
            } else {
                req.flash('info', 'Supplier Created Successfully');
                res.redirect('/supplier');
            }
        });
    }
});


router.post('/update', guard.ensureLoggedIn(), async (req, res, next) => {

    const supplier = await Account.findById(req.body._supplierId);

    let firstname = req.body.firstname;
    let middlename = req.body.middlename;
    let lastname = req.body.lastname;
    let phone = req.body.phone;
    let email = req.body.email;
    let address = req.body.address;
    
    req.checkBody('firstname', 'First name is required').notEmpty();
    req.checkBody('lastname', 'Last name is required').notEmpty();
    req.checkBody('phone', 'Phone is required').notEmpty();
    req.checkBody('email', 'E-mail', 'E-mail is required').isEmail();
    req.checkBody('address', 'Address is required').notEmpty();
    
    var errors = req.validationErrors();

    console.log(errors);

    if(errors){
        req.session.errors = errors;
        res.redirect('/supplier');
    } else {
        
        supplier.firstname = req.body.firstname;
        supplier.middlename = req.body.middlename;
        supplier.lastname = req.body.lastname;
        supplier.phone = req.body.phone;
        supplier.email = req.body.email;
        supplier.save((err) => {
            if (err) {
              console.log(err);
            } else {
                req.flash('info', 'Supplier Updated Successfully');
              res.redirect('/supplier');
            }
        });
    }
});


router.post('/delete', guard.ensureLoggedIn(), async (req, res) => {

    const id = req.body.id;
    await Account.findByIdAndRemove(id);
    res.send('success');
  });
  


export default router;