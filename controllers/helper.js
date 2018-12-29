/**
 * @author yangyufei
 * @date 2018-12-26 08:51:29
 * @desc
 */
const tools     = require('../common/tools');
const logger    = require('../common/logger');
const srvAction = require('../services/srvAction');

/**
 * 统一处理信息
 * @param req
 * @param res
 * @param handler
 * @param msg
 * @returns {Promise<void>}
 */
exports.warp = async (req, res, handler, msg, saveAction = true, ) => {
    let result;

    try {
        let data = await handler();

        result = tools.getSuccessRes(msg, data);
    } catch (err) {
        logger.error(err);
        result = tools.getResFromError(err);
    } finally {
        res.send(result);
        logger.info(JSON.stringify(result));
        (saveAction === true || saveAction === false && req.method === 'POST') && await srvAction.saveUserAction(req, result);
    }
};