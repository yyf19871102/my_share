/**
 * @author yangyufei
 * @date 2018-12-26 08:45:34
 * @desc
 */
const express   = require('express');
const router    = express.Router();

const srvUser   = require('../services/srvUser');
const auth      = require('../middlewares/auth');
const SysConf   = require('../config');
const helper    = require('./helper');

router.post('/login', async (req, res) => {
    await helper.warp(req, res, async () => {
        let {userName, password} = req.body;
        let {sessionId, user} = await srvUser.login(userName, password);
        req.user = user;

        res.cookie(SysConf.SESSION_KEY, sessionId);
        res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
        res.append('see', 'aaa');

        return user;
    }, '登录成功！');
});

router.post('/logout', auth.needLogin, async (req, res) => {
    await helper.warp(req, res, async () => {
        let sessionId = req.cookies[SysConf.SESSION_KEY];

        await srvUser.logout(sessionId);

        return {user: req.user, sessionId};
    }, '登出成功！');
});

router.post('/user/add', auth.needLogin, auth.needRoot, async (req, res) => {
    await helper.warp(req, res, async () => {
        return await srvUser.addUser(req.body)
    }, '添加用户成功！');
});

router.post('/user/delete', auth.needLogin, auth.needRoot, async (req, res) => {
    await helper.warp(req, res, async () => {
        let {userId, block, completeDelete} = req.body;

        return await srvUser.deleteUser(userId, block, completeDelete);
    }, '删除用户成功！');
});

router.post('/user/update', auth.needLogin, auth.needRoot, async (req, res) => {
    await helper.warp(req, res, async () => {
        let setter = req.body;

        let userId = setter.id;
        delete setter.id;

        return await srvUser.updateUser(userId, setter);
    }, '修改用户成功！');
});

router.get('/user/search', auth.needLogin, async (req, res) => {
    await helper.warp(req, res, async () => {
        return await srvUser.searchUser(req.query);
    }, '查询用户成功！');
});

module.exports = router;