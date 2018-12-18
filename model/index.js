/**
 * @author yangyufei
 * @date 2018-12-17 19:03:46
 * @desc
 */
const mongoose  = require('mongoose');

const connector = require('./mongo_connector');

require('./item');

exports.Item    = mongoose.model('item');