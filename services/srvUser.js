/**
 * @author yangyufei
 * @date 2018-12-21 20:37:39
 * @desc
 */
const crypto    = require('crypto');
const uuid      = require('uuid/v4');
const _         = require('lodash');

const {User}    = require('../model');
const tools     = require('../common/tools');
const redis     = require('../redis_connector').getInstance();
const SysConf   = require('../config');
const helper    = require('./helper');

const {ERROR_OBJ} = SysConf;

/**
 * 检查该sessionId是否登录
 * @param sessionId
 * @returns {Promise<boolean>}
 */
exports.checkLogin = async (sessionId, userName, password) => {
    if (sessionId) {
        let userId = await redis.get(helper.getSessionKey(sessionId));

        !userId && tools.threw(ERROR_OBJ.BAD_SESSION, `该session已经失效，请重新登录：${sessionId}`);

        let userStr = await redis.get(helper.getUserKey(userId));

        if (!userStr) {
            let user = await User.findOne({_id: userId}).exec();

            if (user) {
                await redis.set(helper.getUserKey(userId), user.toJSON());
                await redis.expire(helper.getUserKey(userId), SysConf.EXPIRE.USER);

                return user.toJSON();
            } else {
                tools.threw(ERROR_OBJ.BAD_SESSION, `根据session对应的userId查不到对应的user（mongodb中）：${userId}`, {sessionId, userId});
            }
        } else {
            return JSON.parse(userStr);
        }
    } else if (SysConf.CFG.DIRECT) {
        let _password = crypto.createHash('md5').update(`${password}:${SysConf.SALT}`).digest('hex');

        let user = await User.findOne({name: userName, password: _password}).exec();

        if (user) {
            return user;
        } else {
            tools.threw(ERROR_OBJ.BAD_SESSION, 'session不存在！', {sessionId});
        }
    } else {
        tools.threw(ERROR_OBJ.BAD_SESSION, 'session不存在！', {sessionId});
    }
};

/**
 * 校验用户是否是root
 * @param user
 * @returns
 */
exports.checkRoot = user => {
    return user && user.isRoot === true;
};

/**
 * 用户登录
 * @param userName
 * @param password
 * @returns {Promise<*>}
 */
exports.login = async (userName, password) => {
    let user = await User.findOne({name: userName, status: SysConf.STATUS.ACTIVE}).exec();

    !user && tools.threw(ERROR_OBJ.NO_USER, '用户不存在！', {userName});

    let _password = crypto.createHash('md5').update(`${password}:${SysConf.SALT}`).digest('hex');
    user.password !== _password && tools.threw(ERROR_OBJ.NO_USER, '密码错误！', {userName, password});

    await redis.set(helper.getUserKey(user._id), JSON.stringify(user.toJSON()));

    let sessionId = uuid();
    await redis.set(helper.getSessionKey(sessionId), user._id);
    await redis.expire(helper.getSessionKey(sessionId), SysConf.EXPIRE.SESSION);

    return {sessionId, user};
};

/**
 * 登出
 * @param sessionId
 * @returns {Promise<void>}
 */
exports.logout = async (sessionId) => {
    await redis.del(helper.getSessionKey(sessionId));
};

/**
 * 添加用户
 * @param userObj
 * @returns {Promise<{code: (*|number), msg: (*|string), data: (*|{})}>}
 */
exports.addUser = async userObj => {
    userObj._id && delete userObj._id;
    userObj.password && (userObj.password = crypto.createHash('md5').update(`${userObj.password}:${SysConf.SALT}`).digest('hex'));

    let user = await User.findOne({name: userObj.name}).exec();
    user && tools.threw(ERROR_OBJ.DEFAULT, `该用户已经被注册了${user.name}`, userObj);

    let newUser = await User.create(userObj);

    return newUser.toJSON();
};

/**
 * 删除用户
 * @param userId
 * @returns {Promise<{code: (*|number), msg: (*|string), data: (*|{})}>}
 */
exports.deleteUser = async (userId, isBlock = false, completedDelete = false) => {
    let res = completedDelete ? await User.deleteOne({_id: userId}).exec() : await User.findOneAndUpdate({_id: userId}, {$set: {status: isBlock ? SysConf.STATUS.DELETED : SysConf.STATUS.BLOCK}}, {new: true}).exec();

    await redis.del(helper.getUserKey(userId));

    return completedDelete ? res : res.toJSON();
};

/**
 * 查询用户
 * @param query
 * @returns {Promise<*>}
 */
exports.searchUser = async query => {
    query = helper.sortObject(query);

    let resData;
    let cacheRes = await redis.get(helper.getUserQueryKey(query));

    if (cacheRes) {
        resData = JSON.parse(cacheRes);
    } else {
        let opts = {};
        query.pageNo && (opts.skip = (query.pageNo - 1) * query.pageSize);
        query.pageSize && (opts.limit = parseInt(query.pageSize));

        let cond = _.cloneDeep(query);
        delete cond.pageNo;
        delete cond.pageSize;
        !query.hasOwnProperty('status') && (cond.status = {$gt: SysConf.STATUS.DELETED});

        let totalPage = await User.countDocuments({status: {$gt: SysConf.STATUS.DELETED}}).exec();
        totalPage = Math.ceil(totalPage / opts.limit);

        let records = await User.find(cond, null, opts).exec();

        resData = records ? records.map(record => record.toJSON()) : [];
        await redis.set(helper.getUserQueryKey(query), JSON.stringify(resData));
        await redis.expire(helper.getUserQueryKey(query), 15);
    }

    return resData;
};

/**
 * 修改用户
 * @param userId
 * @param setter
 * @returns {Promise<*>}
 */
exports.updateUser = async (userId, setter) => {
    let result = await User.findOneAndUpdate({_id: userId}, {$set: setter}, {new: true}).exec();

    !result && tools.threw(ERROR_OBJ.BAD_ITEM, '修改user失败！', {userId, setter});

    await redis.del(helper.getUserKey(userId));

    return result.toJSON();
};