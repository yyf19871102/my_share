/**
 * @author yangyufei
 * @date 2018-12-25 20:27:21
 * @desc
 */
const expect    = require('chai').expect;

const srvItem   = require('../../services/srvSharedItem');
const redis     = require('../../redis_connector').getInstance();
const helper    = require('../../services/helper');
const tools     = require('../../common/tools');
const SysConf   = require('../../config');

describe('services/srvShareItem', () => {
    it('流程整体测试', async () => {
        let pass = true;

        try {
            let mockFile = {
                size    : 100,
                originalName: 'abc.zip',
            };
            let item = await srvItem.addItem(mockFile, {}, {_id: '1234'});

            try {
                await srvItem.getFilePath(item._id);
                pass = false;
                return;
            } catch (err) {
                if (err.message !== '下载的item不存在（服务器）！') {
                    pass = false;
                    return;
                }
            }

            await srvItem.updateItem(item._id, {version: '1.0'});

            let query = {_id: item._id};
            let items = await srvItem.searchItems({_id: item._id});
            items.length < 1 && tools.threw(null, 'item不存在！');
            !await redis.exists(helper.getItemQueryKey(query)) && tools.threw(undefined, '查询数据未存入缓存！');

            await srvItem.deleteItem(item._id, undefined, true);
        } catch (err) {
            console.error(err);
            pass = false;
        } finally {
            expect(pass).to.be.true;
        }
    });
});