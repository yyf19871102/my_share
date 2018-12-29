/**
 * @author yangyufei
 * @date 2018-12-26 09:22:10
 * @desc
 */
const express   = require('express');
const router    = express.Router();
const multer    = require('multer');
const fs        = require('fs');

const srvItem   = require('../services/srvSharedItem');
const auth      = require('../middlewares/auth');
const SysConf   = require('../config');
const helper    = require('./helper');
const logger    = require('../common/logger');
const tools     = require('../common/tools');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, SysConf.CFG.SAVE_DIR)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({storage});

router.post('/item/add', auth.needLogin, auth.needRoot, upload.single('item'),  async (req, res) => {
    await helper.warp(req, res, async () => {
        return await srvItem.addItem(req.file, req.body, req.user);
    }, '上传成功！');
});

router.post('/item/delete', auth.needLogin, auth.needRoot, async (req, res) => {
    await helper.warp(req, res, async () => {
        let {id, block, completeDelete} = req.body;

        return await srvItem.deleteItem(id, block, completeDelete);
    }, '删除共享文件成功');
});

router.post('/item/update', auth.needLogin, auth.needRoot, async (req, res) => {
    await helper.warp(req, res, async () => {
        let setter = req.body;
        let id = setter.id;
        delete setter.id;

        return await srvItem.updateItem(id, setter);
    }, '修改文件成功！');
});

router.get('/item/search', auth.needLogin, async (req, res) => {
    await helper.warp(req, res, async () => {
        return await srvItem.searchItems(req.query);
    }, '查询文件成功！');
});

router.get('/item/download', auth.needLogin, async (req, res) => {
    try {
        let {id} = req.query;
        let filePath = await srvItem.getFilePath(id);

        res.attachment(filePath);
        fs.createReadStream(filePath).pipe(res);
    } catch (err) {
        logger.error(err);
        return tools.getResFromError(err);
    }
});

module.exports = router;