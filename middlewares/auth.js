/**
 * @author yangyufei
 * @date 2018-12-26 08:30:57
 * @desc
 */

const logger    = require('../common/logger');
const srvUser   = require('../services/srvUser');
const tools     = require('../common/tools');
const SysConf   = require('../config');

/**
 * 校验用户是否登录
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.needLogin = async (req, res, next) => {
    try {
        let sessionId = req.cookies[SysConf.SESSION_KEY];
        let {userName, password} = req.query;

        let user = await srvUser.checkLogin(sessionId, userName, password);

        req.user = user;

        next();
    } catch (err) {
        logger.error(err);
        res.send(tools.getResFromError(err));
    }
};

/**
 * 校验root权限
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.needRoot = async (req, res, next) => {
    try {
        srvUser.checkRoot(req.user) ? next() : tools.threw(SysConf.ERROR_OBJ.BAD_AUTH, '需要root权限！', req.user);
    } catch (err) {
        logger.error(err);
        res.send(tools.getResFromError(err));
    }
};