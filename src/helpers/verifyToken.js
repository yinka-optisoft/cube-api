
var jwt = require('jsonwebtoken');
// var Account = require('../models/account');
import Account from '../models/account';
// var config = require('../config');

function verifyToken(req, res, next) {
  var token = req.headers.authorization;
  console.log(req.body);
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, 'cube7000Activated', async (err, decoded) => {
    if (err)
      console.log(err);
    // return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    req.user = await Account.findOne({ _id: req.userId });
    next();
  });
}
module.exports = verifyToken;
