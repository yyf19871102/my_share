/**
 * @author yangyufei
 * @date 2018-12-25 13:23:08
 * @desc
 */
const expect    = require('chai').expect;

const srvUser   = require('../../services/srvUser');
const redis     = require('../../redis_connector').getInstance();
const helper    = require('../../services/helper');
const tools     = require('../../common/tools');
const SysConf   = require('../../config');

describe('services/srvUser', () => {
    it('流程整体测试', async () => {
        let pass = true;

        try {
            // 查询
            let userList = await srvUser.searchUser({name: 'userTest'});

            // 添加
            let user = userList.length > 0 ? userList[0] : await srvUser.addUser({name: 'userTest', password: '123'});

            // 登录
            let sessionId = await srvUser.login('userTest', '123');
            !await redis.exists(helper.getSessionKey(sessionId)) && tools.threw(undefined, 'session 未加入缓存！');

            // 校验登录
            !await srvUser.checkLogin(sessionId) && tools.threw(undefined, '登录后session无效！');

            // 登出
            await srvUser.logout(sessionId);
            await redis.exists(helper.getSessionKey(sessionId)) && tools.threw(undefined, '登出后应该清除session缓存！');

            // 登出后使用用户名密码通过校验
            SysConf.CFG.DIRECT && await srvUser.checkLogin(null, 'userTest', '123');

            // 修改
            let randomEmail = `${Math.ceil(Math.random() * 1000)}@163.com`;
            user = await srvUser.updateUser(user._id, {email: randomEmail});

            user.email !== randomEmail && tools.threw(undefined, `updateUser 错误！`);
            await redis.exists(helper.getUserKey(user._id)) && tools.threw(undefined, 'updateUser 后缓存未删除掉！');

            // 查询
            let query = {name: 'userTest'};
            await srvUser.searchUser(query);
            !await redis.exists(helper.getUserQueryKey(query)) && tools.threw(undefined, '查询user后，未缓存数据！');

            // 删除
            await srvUser.deleteUser(user._id, undefined, true);
            await redis.exists(helper.getUserKey(user._id)) && tools.threw(undefined, '删除user后，未缓存数据！');
        } catch (err) {
            console.error(err);
            pass = false;
        } finally {
            expect(pass).to.be.true;
        }
    });
});
