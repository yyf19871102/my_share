/**
 * @author yangyufei
 * @date 2018-12-21 20:42:01
 * @desc
 */
const redis     = require('./redis_connector');

const PREFIX    = `myShare`;

exports.get = async (model, key) => {
    return redis.get(`${PREFIX}:${model}:${key}`);
};


