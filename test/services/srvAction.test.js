/**
 * @author yangyufei
 * @date 2018-12-25 19:44:11
 * @desc
 */
const expect    = require('chai').expect;

const srvAction = require('../../services/srvAction');
const redis     = require('../../redis_connector').getInstance();
const helper    = require('../../services/helper');
const tools     = require('../../common/tools');
const SysConf   = require('../../config');

describe('services/srvAction', () => {
    it('流程整体测试', async () => {
        let pass = true;

        try {
            let mockRequest = {
                originalUrl : '/test/haha',
                method      : 'POST',
                body        : {name: 'sf'},
                user        : {_id: 'test111'}
            };

            // 生成记录
            let record = await srvAction.saveUserAction(mockRequest, {code: 0});

            // 查询记录
            let query = {id: record._id};
            let records = await srvAction.searchRecords(query);
            (records.length < 1 || !await redis.exists(helper.getActionQueryKey(query))) && tools.threw();
        } catch (err) {
            console.error(err);
            pass = false;
        } finally {
            expect(pass).to.be.true;
        }
    });
});