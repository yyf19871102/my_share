/**
 * @author yangyufei
 * @date 2018-12-17 19:11:47
 * @desc
 */
const express   = require('express');
const fs        = require('fs');
const path      = require('path');
const router    = express.Router();
const _         = require('lodash');

const {Item}    = require('./model');
const logger    = require('./common/logger');
const SysConf   = require('./config');
const tools     = require('./common/tools');
const {ERROR_OBJ} = SysConf;

/**
 * 包装方法
 * @param req
 * @param res
 * @param handle
 * @returns {Promise<void>}
 */
const wrap = async (req, res, handle) => {
    try {
        let data = await handle();

        res.send({success: true, msg: '', data: data || {}});
    } catch (err) {
        logger.error(err);
        res.send({sussess: false, msg: err.message})
    }
};

/**
 * 需要验证身份
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const needAuth = async (req, res, next) => {
    try {
        let {user, passwd} = req.body;

        (!user || SysConf.WHITE_LIST[user] !== passwd) && tools.threw(ERROR_OBJ.BAD_AUTH);

        next();
    } catch (err) {
        logger.error(err);
        res.send({sussess: false, msg: err.message})
    }
};

/**
 * 上传一条记录
 */
router.post(SysConf.API.UPLOAD, needAuth, async (req, res) => {
    await wrap(req, res, async () => {
        !req.body.name && tools.threw(ERROR_OBJ.BAD_UPLOAD);

        let count = await Item.countDocuments({name: req.body.name}).exec();
        count > 0 && tools.threw(ERROR_OBJ.BAD_UPLOAD);

        let item = _.cloneDeep(req.body);
        if (item.hasOwnProperty('tags')) item.tags = item.tags.split(',');

        await Item.create(item);
    });
});

/**
 * 删除一条记录
 */
router.post(SysConf.API.DELETE, needAuth, async (req, res) => {
    await wrap(req, res, async () => {
        let {id} = req.body;

        // 查询数据库是是否有记录
        let item = await Item.findOne({_id: id}).exec();

        !item && tools.threw(ERROR_OBJ.NO_ITEM, null, req.body);

        // 查询是否有给item
        let itemPath = path.join(SysConf.CFG.SAVE_DIR, id);

        !fs.existsSync(itemPath) && tools.threw(ERROR_OBJ.NO_ITEM, null, req.body);

        fs.unlinkSync(itemPath);

        await Item.remove({_id: id}).exec();
    });
});

/**
 * 修改记录
 */
router.post(SysConf.API.UPDATE, needAuth, async (req, res) => {
    await wrap(req, res, async () => {
        let {id} = req.body;

        !id && tools.threw(ERROR_OBJ.NO_ID, null, req.body);

        await Item.findOneAndUpdate({_id: id}, {$set: req.body}).exec();
    });
});

/**
 * 下载item
 */
router.get(SysConf.API.DOWNLOAD, async (req, res )=> {
    try {
        let {id} = req.query;

        let item = await Item.findOne({_id: id}).exec();

        !item && tools.threw(ERROR_OBJ.NO_ITEM, null, req.query);

        let itemPath = path.join(SysConf.CFG.SAVE_DIR, item.name);

        !fs.existsSync(itemPath) && tools.threw(ERROR_OBJ.NO_ITEM, null, req.query);

        res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-Disposition': `attachment; filename=${item.name}`,
            "Connection": "close",
        });
        fs.createReadStream(itemPath).pipe(res);
    } catch (err) {
        logger.error(err);
        res.send({sussess: false, msg: '详细错误信息，请查看日志！'})
    }
});

/**
 * 查询item
 */
router.get(SysConf.API.SEARCH, async (req, res) => {
    await wrap(req, res, async () => {
        let query = {};
        let body = req.query;

        if (body.hasOwnProperty('id')) {
            query._id = body.id;
        } else if (body.hasOwnProperty('name')) {
            query.name = {$regex: body.name};
        } else if (body.hasOwnProperty('tag')) {
            query.tags = body.tag;
        }

        let dataList = await Item.find(query).exec();

        dataList = dataList.map(item => {
            let data = item.toJSON();

            data.uri = `http://${SysConf.CFG.HOST}:${SysConf.CFG.PORT}${SysConf.API.DOWNLOAD}?id=${data._id}`;

            return data;
        });

        return dataList;
    });
});

module.exports = router;