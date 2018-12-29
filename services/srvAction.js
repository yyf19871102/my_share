/**
 * @author yangyufei
 * @date 2018-12-25 19:30:48
 * @desc
 */
const _         = require('lodash');

const {UserAction} = require('../model');
const tools     = require('../common/tools');
const SysConf   = require('../config');
const redis     = require('../redis_connector').getInstance();
const helper    = require('./helper');

const {ERROR_OBJ} = SysConf;

/**
 * 记录用户行为
 * @param req
 * @param result
 * @returns {Promise<void>}
 */
exports.saveUserAction = async (req, result) => {
    let userAction = {
        user    : req.user._id,
        url     : req.originalUrl,
        success : result.code === 0,
        method  : req.method,
    };

    req.method === 'GET' && (userAction.additional = req.query);
    req.method === 'POST' && (userAction.additional = req.body);

    let res = await UserAction.create(userAction);
    return res.toJSON();
};

/**
 * 查询用户行为记录
 * @param query
 * @returns {Promise<any>}
 */
exports.searchRecords = async query => {
    query = helper.sortObject(query);

    let resData;
    let cacheRes = await redis.get(helper.getActionQueryKey(query));

    if (cacheRes) {
        resData = JSON.parse(cacheRes);
    } else {
        let opts = {};
        query.pageNo && (opts.skip = (query.pageNo - 1) * query.pageSize);
        query.pageSize && (opts.limit = parseInt(query.pageSize));

        let cond = _.cloneDeep(query);
        delete cond.pageNo;
        delete cond.pageSize;
        if (cond.hasOwnProperty('id')) {
            cond._id = cond.id;
            delete cond.id;
        }

        let totalPage = await UserAction.countDocuments({}).exec();
        totalPage = Math.ceil(totalPage / opts.limit);

        let records = await UserAction.find(cond, null, opts).exec();

        resData = records ? records.map(record => record.toJSON()) : [];
        await redis.set(helper.getActionQueryKey(query), JSON.stringify(resData));
        await redis.expire(helper.getActionQueryKey(query), 15);
    }

    return resData;
};