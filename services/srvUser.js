/**
 * @author yangyufei
 * @date 2018-12-21 20:37:39
 * @desc
 */
const {User, ShareItem} = require('../model');
const redis     = require('../cache/redis_connector').getInstance();

exports.login = async (userName, password) => {

};