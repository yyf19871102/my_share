/**
 * @author yangyufei
 * @date 2018-12-25 08:56:29
 * @desc
 */
const _         = require('lodash');
const fs        = require('fs');
const path      = require('path');

const {ShareItem} = require('../model');
const tools     = require('../common/tools');
const redis     = require('../redis_connector').getInstance();
const SysConf   = require('../config');
const helper    = require('./helper');

const {ERROR_OBJ} = SysConf;

/**
 * 上传一个共享文件
 * @param itemFile 上传文件
 * @param itemObj 该文件的数据表字段
 * @param user 上传用户
 * @returns {Promise<{code: (*|number), msg: (*|string), data: (*|{})}>}
 */
exports.addItem = async (itemFile, itemObj, user) => {
    let itemId = itemFile.originalname;

    let saveItem = _.merge({}, itemObj, {
        _id     : itemId,
        size    : itemFile.size,
        postBy  : user._id,
        isCompressed: /zip|rar$/.test(itemId)
    });

    let _item = await ShareItem.findOne({_id: itemId}).exec();
    _item && tools.threw(ERROR_OBJ.DEFAULT, `该文件已经存在：${itemId}`, itemObj);

    let item = await ShareItem.create(saveItem);
    return item.toJSON();
};

/**
 * 删除一个item
 * @param itemId
 * @returns {Promise<*>}
 */
exports.deleteItem = async (itemId, block = false, completedDelete = false) => {
    let result = completedDelete ? await ShareItem.deleteOne({_id: itemId}).exec() : await ShareItem.findOneAndUpdate({_id: itemId}, {$set: {status: block ? SysConf.STATUS.DELETED : SysConf.STATUS.BLOCK}}, {new: true}).exec();

    !result && tools.threw(ERROR_OBJ.BAD_ITEM, 'item删除失败！', {itemId});

    if (completedDelete) {
        let itemPath = path.join(SysConf.CFG.SAVE_DIR, itemId);
        fs.existsSync(itemPath) && fs.unlinkSync(itemPath);
    }

    await redis.del(helper.getItemKey(itemId));

    return completedDelete ? result : result.toJSON();
};

/**
 * 修改item
 * @param itemId
 * @param setter
 * @returns {Promise<*>}
 */
exports.updateItem = async (itemId, setter) => {
    let result = await ShareItem.findOneAndUpdate({_id: itemId}, {$set: setter}, {new: true}).exec();

    !result && tools.threw(ERROR_OBJ.BAD_ITEM, '修改item失败！', {itemId, setter});

    await redis.del(helper.getItemKey(itemId));

    return result.toJSON();
};

/**
 * 查询item
 * @param query
 * @returns {Promise<*>}
 */
exports.searchItems = async query => {
    query = helper.sortObject(query);

    let resData;
    let cacheRes = await redis.get(helper.getItemQueryKey(query));

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

        let totalPage = await ShareItem.countDocuments({status: {$gt: SysConf.STATUS.DELETED}}).exec();
        totalPage = Math.ceil(totalPage / opts.limit);

        let records = await ShareItem.find(cond, null, opts).exec();

        resData = records ? records.map(record => record.toJSON()) : [];
        await redis.set(helper.getItemQueryKey(query), JSON.stringify(resData));
        await redis.expire(helper.getItemQueryKey(query), 15);
    }

    return resData;
};

/**
 * 获取下载文件路径
 * @param itemId
 * @returns {Promise<*>}
 */
exports.getFilePath = async itemId => {
    let item = await ShareItem.findOne({_id: itemId}).exec();

    !item && tools.threw(ERROR_OBJ.BAD_ITEM, '下载的item不存在（数据库）！', {itemId});

    let itemPath = path.join(SysConf.CFG.SAVE_DIR, item._id);

    !fs.existsSync(itemPath) && tools.threw(ERROR_OBJ.BAD_ITEM, '下载的item不存在（服务器）！', {itemId});

    return itemPath;
};