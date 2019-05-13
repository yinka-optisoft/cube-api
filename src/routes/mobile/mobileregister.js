// var express = require('express');
// var passport = require('passport');
import express from 'express';
import passport from 'passport';
import Store from '../../models/store';
import Account from '../../models/account';
import Branch from '../../models/branch';
import multer from 'multer';
import jwt from 'jsonwebtoken';
// var jwt = require('jsonwebtoken');
var verifyToken = require('../../helpers/verifyToken');
// var multer = require('multer');
import path from 'path';
var imageName;

var storage = multer.diskStorage({

  destination: function(req, file, cb) {
    console.log(file);
    cb(null, 'src/public/images/store/');
  },
  filename: function(req, file, cb) {

    imageName = Date.now() + path.extname(file.originalname);
    cb(null, imageName); // Appending extension
  }
});

// const storage = multer.diskStorage({
//   destination: async function(req, file, cb) {
//     try {
//        cb(null, './uploads');
//     } catch (E) {
//       cb(E);
//     }
//   },
//   filename: function(req, file, cb) {
//     cb(null, file.originalname);
//   }
// });


var upload = multer({ storage: storage });
//
/*
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log(req.file);
      cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
        imageName = Date.now() + path.extname(file.originalname);
      cb(null, imageName); // Appending extension
    }
  });
  */
//  import Branch from '../models/branch';
// // import Role from '../models/role';
// // import Category from '../models/category';
// // import Bussiness from '../models/bussiness';
//  import Account from '../models/account';
// // import formidable from 'formidable';
// import fs from 'fs';
// import path from 'path';
// import guard from 'connect-ensure-login';
// import { check, validationResult } from 'express-validator/check';

const router = express.Router();

router.get('/details', verifyToken, async (req, res) => {

  const findStoreDetails = await Store.findById({ _id: req.user._storeId });
  const branchCount = await Branch.find({ _storeId: req.user._storeId }).count();
  const UsersCount = await Account.find({ _storeId: req.user._storeId }).count();
  if (findStoreDetails) {
    console.log(findStoreDetails);
    return res.json({ success: true, userCount: UsersCount, storeDetails:  findStoreDetails, branchCount: branchCount });
  } else {
    return res.json({ error:  'Error occured fetching store details' });
  }
});

// const generateUniqueID = async storeShort => {
//   const ADMIN_ID = storeShort + Math.round(Math.random() * 100000);
//   const exists = await Account.count({ username: ADMIN_ID });
//   while (exists > 0) generateUniqueID(storeShort);
//   return ADMIN_ID;
// };


router.post('/create/store', upload.single('avatar'), async (req, res) => {

  console.log(imageName);
  if (imageName == undefined) {
    imageName = 'defaultStore.jpg';
  }


  const findUser = await Account.findOne({ username: req.body.username });

  if (findUser) {
    return res.json({ exist: 'Username already exist' });
  }

  try {
    const newStore = new Store();
    newStore.name = req.body.store_name;
    newStore.email = req.body.store_email;
    newStore.phone = req.body.store_phone;
    newStore.address = req.body.store_address;
    newStore.shortCode = req.body.shortCode;
    newStore.website = req.body.website;
    newStore.businessType = req.body.businessType;
    newStore.country = req.body.storeCountry;
    newStore.state = req.body.storeState;
    newStore.city = req.body.storeCity;
    newStore.logo = imageName;
    await newStore.save(function(err) {
      if (err) {
        // console.log(err);
      }
    });
    const newBranch = new Branch();
    newBranch._storeId = newStore._id;
    newBranch.name = req.body.branch_name;
    newBranch.address = req.body.branch_address;
    newBranch.email = req.body.branch_email;
    newBranch.phone = req.body.branch_phone;
    newBranch.country = req.body.branch_country;
    newBranch.state = req.body.branch_state;
    newBranch.city = req.body.branch_city;
    await newBranch.save(function(err) {
      if (err) {
        // console.log(err);
      }
    });

    const newAdmin = req.body;
    const password = newAdmin.password;
    delete newAdmin.password;
    newAdmin.roleId = 'admin';
    newAdmin._storeId = newStore._id;
    newAdmin._branchId = newBranch._id;
    newAdmin.username = req.body.username;
    newAdmin.firstname = req.body.firstname;
    newAdmin.middlename = req.body.middlename;
    newAdmin.lastname = req.body.lastname;
    newAdmin.address = req.body.address;
    newAdmin.phone = req.body.phone;
    newAdmin.email = req.body.email;
    newAdmin.passport = 'defaultUser.png';

    Account.register(new Account(newAdmin), password,
                     async (err, account) => {
                       console.log(account._id);
                       const tokenG = await Account.findById(account._id);
                       console.log(tokenG);
                       tokenG.token = await jwt.sign({ id: account._id }, 'cube7000Activated');
                       await tokenG.save(function(err) {
                         if (err) {
                           console.log(err);
                         }
                         console.log(tokenG);
                       });
                       // });
                       if (err) {
                         console.log(err);
                       } else {
                         console.log('success');
                         return res.json({ 'success': 'Store Created successfully', user: account });
                       }
                     });

  } catch (e) {
    console.log(e);
  }
});


export default router;
// export default router;
