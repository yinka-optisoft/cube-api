import express from 'express';
import mongoose from 'mongoose';
import Account from '../models/account';

import Expense from '../models/expense';

import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';
import BranchProduct from '../models/branchProduct';
var verifyToken = require('../helpers/verifyToken');


const router = express.Router();

router.get('/all', guard.ensureLoggedIn(), async (req, res, next) => {
    if(req.user.roleId == 'admin'){
        Expense.find({_storeId: req.user._storeId}, function(err, docs){
            if(err){
                return next(err);
            }
    
            res.json(docs)
        }).populate('_branchId');
    }
    else{
        const storeId = req.user._storeId, userId = req.user._id, branchId = req.user._branchId;
        Expense.find({_storeId: storeId, _createdBy: userId, _branchId: branchId}, function(err, docs){
            if(err){
                return next(err);
            }
    
            res.json(docs)
        }).populate('_branchId');
    }

});

router.get('/mobile/all', verifyToken, async (req, res, next) => {
    if(req.user.roleId == 'admin'){
        Expense.find({_storeId: req.user._storeId}, function(err, docs){
            if(err){
                return next(err);
            }
    
            res.json(docs)
        }).populate('_branchId');
    }
    else{
        const storeId = req.user._storeId, userId = req.user._id, branchId = req.user._branchId;
        Expense.find({_storeId: storeId, _createdBy: userId, _branchId: branchId}, function(err, docs){
            if(err){
                return next(err);
            }
    
            res.json(docs)
        }).populate('_branchId');
    }

});

router.post('/mobile/add', verifyToken, async (req, res, next) => {

        var expense = await Expense();
        expense._createdBy = req.user._id;
        expense._storeId = req.user._storeId;
        expense._branchId = req.user._branchId;
        expense.amount = req.body.amount;
        expense.category = req.body.category;
        expense.description = req.body.description;
        expense.save((err, exp) => {
            if(err) return next(err);

            res.status(200).json({status:"ok"});
        })
        
    
  });

  router.post('/add', guard.ensureLoggedIn(), async (req, res, next) => {

    let expense = req.body;
    console.log(expense);
    
        // var category = req.query.category;
        // var amount = parseInt(req.query.amount);
        
        // var expense = await Expense({category, amount});
        // expense._createdBy = req.user._id;
        // expense._storeId = req.user._storeId;
        // expense._branchId = req.user._branchId;
        // expense.save((err, exp) => {
        //     if(err) return next(err);

        //     res.json(exp)
        // })
        
    
  });

  router.get('/test', async (req, res, next) => {
      res.json(req.user)
  })

export default router;