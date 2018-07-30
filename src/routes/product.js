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
import supply from '../models/supply';


const router = express.Router();

router.get('/', guard.ensureLoggedIn(), async (req, res, next) => {
    const user = await Account.findById(req.user._id).populate('_roleId');
    const products = await Product.find({ _storeId: req.session._storeId }).populate('_categoryId');
    const categories = await Category.find({ _storeId: req.session._storeId });
    const suppliers = await Account.find({ _storeId: req.user._storeId, _supplierId: 'supplier' });
    const branches = await Branch.find({ _storeId: req.session._storeId });
    res.render('product/manage', { user, suppliers, expressFlash: req.flash('info'), products, branches, categories, layout: 'layouts/user' });
});


router.post('/', guard.ensureLoggedIn(), async (req, res, next) => {

    let name = req.body.name;
    let _categoryId = req.body._categoryId;
    let _supplierId = req.body._supplierId;
    let pieces = req.body.pieces;
    let price = req.body.price;
    let note = req.body.note;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('_categoryId', 'Category is required').notEmpty();
    req.checkBody('_supplierId', 'Supplier is required').notEmpty();
    req.checkBody('pieces', 'Pieces is required').notEmpty();
    req.checkBody('price', 'Price is required').notEmpty();
    
    var errors = req.validationErrors();

    console.log(errors);

    if(errors){
        req.session.errors = errors;
        res.redirect('/product');
    } else {
        const product = await Product(req.body);
        product._storeId = req.user._storeId;
        product.save((err) => {
            if (err) {
              console.log(err);
            } else {
              req.flash('info', 'Product Created');
              res.redirect('/product');
            }
          });
    

    }
});


router.post('/update', guard.ensureLoggedIn(), async (req, res, next) => {

    const product = await Product.findById(req.body._productId);

    let name = req.body.name;
    let _categoryId = req.body._categoryId;
    let _supplierId = req.body._supplierId;
    let pieces = req.body.pieces;
    let price = req.body.price;
    let note = req.body.note;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('_supplierId', 'Supplier is required').notEmpty();
    req.checkBody('_categoryId', 'Category is required').notEmpty();
    req.checkBody('pieces', 'Pieces is required').notEmpty();
    req.checkBody('price', 'Price is required').notEmpty();
    
    var errors = req.validationErrors();

    console.log(errors);

    if(errors){
        req.session.errors = errors;
        res.redirect('/product');
    } else {

        console.log(req.body);

        product._storeId = req.user._storeId;
        product._supplierId = req.body._supplierId;
        product._categoryId = req.body._categoryId;
        product.name = req.body.name;
        product.pieces = req.body.pieces;
        product.price = req.body.price;
        product.note = req.body.note;
        console.log(product);
        product.save((err) => {
            if (err) {
              console.log(err);
            } else {
                req.flash('info', 'Product Updated Successfully');
              res.redirect('/product');
            }
          });
        }
  });



router.post('/delete', guard.ensureLoggedIn(), async (req, res) => {

    const id = req.body.id;
    await Product.findByIdAndRemove(id);
    res.send('success');
  });  



export default router;