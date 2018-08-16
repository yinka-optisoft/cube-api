var express = require('express');
import Store from '../../models/store';
import Account from '../../models/account';
import Branch from '../../models/branch';

var verifyToken = require('../../helpers/verifyToken');
const router = express.Router();

router.get('/details', verifyToken, async (req, res) => {

    const findStoreDetails = await Store.findById({ _id: req.user._storeId });
    const branchCount = await Branch.find({ _storeId: req.user._storeId }).count();
    const UsersCount = await Account.find({ _storeId: req.user._storeId }).count();
    if(findStoreDetails){
        console.log(findStoreDetails);
     return res.json({ success: true, userCount: UsersCount, storeDetails:  findStoreDetails, branchCount: branchCount });
    }else {
        return res.json({ error:  'Error occured fetching store details' });
     }
  });


module.exports = router;
// export default router;
