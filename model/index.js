/**
 * @author yangyufei
 * @date 2018-12-17 19:03:46
 * @desc
 */
const mongoose  = require('mongoose');

const connector = require('./mongo_connector');

require('./item');
require('./shared_item');
require('./user');
require('./user_action');

exports.Item        = mongoose.model('item');
exports.ShareItem   = mongoose.model('sharedItem');
exports.User        = mongoose.model('user');
exports.UserAction  = mongoose.model('userAction');