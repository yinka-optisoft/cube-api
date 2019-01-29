/* Bridge as the name implies is the barrier that users have to cross
 * To be qualified and granted access to a particular route base on
 * Their roles
 */
/*
 import Store from '../models/store';

const testAdmin = (user, role) => user.role === roleId;
const testRole = (user, role) => user.role === _roleId;

const user = await Account.findById(req.user._id).populate('_roleId').populate('_storeId');

const adminOnly = (req, res, next) => {
  if (testRole(req.user, 'admin'))
    next();
  else
  if (user.roleId === 'admin') {
    res.redirect('/admin/dashboard');
  } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Store') {
    res.redirect('/admin/dashboard');
  } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Store') {
    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId._id}`);
  } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Branch') {
    res.redirect(`/branch/admin/dashboard/${user._storeId._id}/${user._branchId._id}`);
  } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Branch') {
    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId._id}`);
  }
};


const adminOrStaff = (req, res, next) => {
  if (testRole(req.user, "5b717d0e4edd1a2bb047309c") || testRole(req.user, "5b717cfb4edd1a2bb047309b"))
    next();
  else
  if (user.roleId === 'admin') {
    res.redirect('/admin/dashboard');
  } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Store') {
    res.redirect('/admin/dashboard');
  } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Store') {
    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId._id}`);
  } else if (user._roleId.name === 'admin' && user._roleId.roleType === 'Branch') {
    res.redirect(`/branch/admin/dashboard/${user._storeId._id}/${user._branchId._id}`);
  } else if (user._roleId.name === 'staff' && user._roleId.roleType === 'Branch') {
    res.redirect(`/staff/dashboard/${user._storeId._id}/${user._branchId._id}`);
  }
};


export { adminOnly, adminOrStaff };
*/