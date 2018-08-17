/* Bridge as the name implies is the barrier that users have to cross
 * To be qualified and granted access to a particular route base on
 * Their roles
 */
/*import Store from '../models/store';
const testRole = (user, role) => user.role === role;

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
  if (testRole(req.user, 'admin') || testRole(req.user, 'staff'))
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