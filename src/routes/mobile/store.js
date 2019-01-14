var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
import Store from '../../models/store';
import Account from '../../models/account';
import Branch from '../../models/branch';
const router = express.Router();
const generateUniqueID = async storeShort => {
  const ADMIN_ID = storeShort + Math.round(Math.random() * 100000);
  const exists = await Account.count({ username: ADMIN_ID });
  while (exists > 0) generateUniqueID(storeShort);
  return ADMIN_ID;
};


  router.post('/create/store', async (req, res) => {
        console.log(req.body);
        try {
        const newStore = new Store();
        newStore.name = req.body.store_name;
        newStore.email = req.body.store_email;
        newStore.phone = req.body.store_phone;
        newStore.store_address = req.body.store_address;
        newStore.shortCode = req.body.shortCode;
        newStore.website = req.body.website;
        newStore.businessType = req.body.businessType;
        newStore.country = req.body.storeCountry;
        newStore.state = req.body.storeState;
        newStore.city = req.body.storeCity;
        
        await newStore.save(function(err) {
          if (err) {
            console.log(err);
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
          if (err){
              console.log(err);
            } 
        });

        const newAdmin = req.body;
        const password = newAdmin.password;
        delete newAdmin.password;
        newAdmin.roleId = 'admin';
        newAdmin._storeId = newStore._id;
        newAdmin._branchId = newBranch._id;
        newAdmin.username = await generateUniqueID(newStore.shortCode);
        newAdmin.firstname = req.body.firstname;
        newAdmin.middlename = req.body.middlename;
        newAdmin.lastname = req.body.lastname;
        newAdmin.address = req.body.address;
        newAdmin.phone = req.body.phone;
        newAdmin.email = req.body.email;
        Account.register(new Account(newAdmin), password,
           (err, account) => {
            const accountId = String(account._id);
            console.log(accountId);
          // Account.findByIdAndUpdate(account._id, { token: jwt.sign(accountId, 'cube7000Activated')});
           Account.findById(account._id, function (err, doc) {
             console.log(doc);
            if (err){
              console.log(err);
            } 
            doc.token = jwt.sign({ id: doc._id }, 'cube7000Activated');
            doc.save(function(err){
              if(err){
                console.log(err);
              }
            });
          });
            if (err) {
              console.log(err);
            } else {
              console.log('success');
             return  res.json({'success': 'Store Created successfully', user: account});
            }
        });

      } catch (e) {
        console.log(e);
    }
  });




  
router.post('/login', function(req, res, next) {
  console.log(req.body.username, req.body.password);
  passport.authenticate('local', function(err, user, info) {
    if (err)
      return res.json({ 'error': 'Invalid login one' });

    if (!user)
      return res.json({ 'error': 'Invalid login two' });
    req.logIn(user, function(err) {
      if (err) { 
        console.log(err);
        return res.json({ 'error': 'An error occured' });
      }
        console.log(user);
      return res.json({ message: 'login was successsful', user: user });
      // res.redirect('/');
    });

  })(req, res, next);
});


/*
  router.post('/login', passport.authenticate('local'), async (req, res) => {

    console.log(req.body);
   // const store = await Store.findById(req.user._storeId);
    //if (!store)  return res.json({ 'error': 'Invalid Store' });
    //req.session._storeId = store._id;
    req.session.save((err) => {
      if (err) {
        console.log(err);
        return res.json({ 'error': 'An error occur' });
      }
      console.log(req.user)
      return res.json({ 'success':'Login successfully', user: req.user});
    });
  });
*/
  

  // router.post('/create/branch', async (req, res) => {

  //   console.log(req.body);

  // const branch = new Branch();
  // branch.name = 

  // await branch.save(function(err) {
  //     if (err){
  //         console.log(err);
  //         // console.log("unable to save to database");
  //       }else{
  //         res.send('Store Created successfully');
  //       }
        
  //   });
  // });


// router.get('/register', async (req, res) => {
//   const bussiness = await Bussiness.find();
//   res.render('site/register', { bussiness, expressFlash: req.flash('info'), layout: 'layouts/site' });
// });


// router.get('/login', (req, res) => {
//   res.render('site/index', { expressFlash: req.flash('info'), user: req.user,
//                              error: req.flash('error'),
//                              layout: false });
// });




// router.post('/create-store', guard.ensureLoggedIn(), async (req, res, next) => {
// router.post('/create-store', async (req, res, next) => {
//   const form = new formidable.IncomingForm();

//   form.parse(req, async (err, fields, files) => {

//     // fields.checkBody('name', 'company name is required').isEmpty();
//     // fields.checkBody('email', 'company email is required').isEmail();

//       try {
//       const newStore = new Store();
//       const logo = files.logo;
//       newStore.name = fields.name;
//       newStore.email = fields.email;
//       newStore.phone = fields.phone;
//       newStore.address = fields.address;
//       newStore.shortCode = fields.shortCode;
//       newStore.website = fields.website;
//       newStore._businessId = fields.businessType;
//       newStore.country = fields.country;
//       newStore.state = fields.state;
//       newStore.city = fields.city;
//       if (logo && logo.name) {
//           const name = `${Math.round(Math.random() * 10000)}.${logo.name.split('.').pop()}`;
//           const dest = path.join(__dirname, '..', 'public', 'images', 'store', name);
//       fs.readFile(logo.path, function(err, data) {
//         fs.writeFile(dest,
//                       data, function(err) {
//                         fs.unlink(logo.path, async (err) => {
//                           if (err) {
//                             res.status(500);
//                             res.json(err);
//                           } else {
//                           newStore.logo = name;
//                             await newStore.save(function(err) {
//                               if (err) {
//                                 console.log(err);
//                               } 
//                             });
//                             const newBranch = new Branch();
//                             newBranch._storeId = newStore._id;
//                             newBranch.name = fields.branch_name;
//                             newBranch.address = fields.branch_address;
//                             newBranch.phone = fields.branch_phone;
//                             newBranch.country = fields.branch_country;
//                             newBranch.state = fields.branch_state;
//                             newBranch.city = fields.branch_city;
//                             await newBranch.save(function(err) {
//                               if (err){
//                                   console.log(err);
//                                 } 
                                
//                             });

//                             const newAdmin = fields;
//                             const password = newAdmin.password;
//                             delete newAdmin.password;
//                             newAdmin.role = fields.role;
//                             newAdmin._storeId = newStore._id;
//                             newAdmin._branchId = newBranch._id;
//                             newAdmin.username = await generateUniqueID(newStore.shortCode);
//                             newAdmin.firstname = fields.firstname;
//                             newAdmin.middlename = fields.middlename;
//                             newAdmin.lastname = fields.lastname;
//                             newAdmin.address = fields.admin_address;
//                             newAdmin.phone = fields.admin_phone;
//                             newAdmin.email = fields.admin_email;
//                             Account.register(new Account(newAdmin), password,
//                               (err, account) => {
//                                 if (err) {
//                                   console.log(err);
//                                 } else {
//                                   req.flash('info', `Store created successfully Your Key is ${newAdmin.username}, This is the Key you will use to login to your Company`);
//                                   res.redirect('/login');
//                                 }
//                             });
//                           }
//                         });
//                       });
//       });
//     }
//   } catch (e) {
//       console.log(e);
//   }
//   });
// });


// // create account roles
// router.get('/roles', guard.ensureLoggedIn(), async (req, res) => {
//   const roles = await Role.find({ _storeId: req.session._storeId });
//   const category = await Category.find({ _storeId: req.session._storeId });
//   const bussiness = await Bussiness.find({ _storeId: req.session._storeId });
//   res.render('role/manage', { roles, category, bussiness, expressFlash: req.flash('success'), layout: 'layouts/user' });
// });


// // update branch
// router.post('/roles', guard.ensureLoggedIn(), async (req, res, next) => {

//   const role = await Role();

//   role._storeId = req.session._storeId;
//   role.name = req.body.name;
//   await role.save(function(err) {
//     if (err) {
//       console.log(err);
//     } else {
//       req.flash('success', 'Role Saved Successfully');
//       res.redirect('/store/roles');
//     }
//   });
// });


// // add bussiness type
// router.post('/bussiness', guard.ensureLoggedIn(), async (req, res, next) => {

//   const bussiness = await Bussiness();

//   bussiness.name = req.body.name;
//   await bussiness.save(function(err) {
//     if (err) {
//       console.log(err);
//     } else {
//       req.flash('success', 'Bussiness Saved Successfully');
//       res.redirect('/store/roles');
//     }
//   });
// });


// // category page
// router.get('/categories', guard.ensureLoggedIn(), async (req, res) => {
//   const categories = await Category.find({ _storeId: req.session._storeId });
//   const category = await Category.findOne({ _storeId: req.session._storeId });
//   console.log(category);
//   res.render('product/category', { categories, category, expressFlash: req.flash('success'), layout: 'layouts/user' });
// });

// // Add ctegory
// router.post('/category', guard.ensureLoggedIn(), async (req, res, next) => {

//   const category = await Category();

//   category._storeId = req.session._storeId;
//   category.name = req.body.name;
//   category.discription = req.body.discription;
//   await category.save(function(err) {
//     if (err) {
//       console.log(err);
//     } else {
//       req.flash('success', 'Category Saved Successfully');
//       res.redirect('/store/categories');
//     }
//   });
// });


// // update ctegory
// router.post('/category/update', guard.ensureLoggedIn(), async (req, res, next) => {

//   const category = await Category.findById(req.body._categoryId);

//   console.log(category);

//   category.name = req.body.name;
//   category.discription = req.body.discription;
//   await category.save(function(err) {
//     if (err) {
//       console.log(err);
//     } else {
//       req.flash('success', 'Category Update Successfully');
//       res.redirect('/store/categories');
//     }
//   });
// });


// // delete ctegory
// router.post('/category/delete', guard.ensureLoggedIn(), async (req, res, next) => {

//   await Category.findById(req.body.id).remove();
//   res.send('success');
// });


module.exports = router;
// export default router;
