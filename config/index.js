/**
 * @auth yangyufei
 * @date 2018-12-15 17:22:35
 * @desc 配置文件
 *
 * //TODO 根据项目配置相关选项
 */
const _     = require('lodash');
const fs    = require('fs');
const path  = require('path');

const ENV   = process.env.NODE_ENV || 'development';

let config = {
	WHITE_LIST  : {
	    yyf     : '19871102'
    },

	// 错误相关信息
	ERROR_OBJ   : {
		SUCCESS     : {code: 0, msg: '操作成功！'},

		DEFAULT     : {code: 100, msg: '系统错误！'},
        NO_ITEM     : {code: 101, msg: 'item不存在！'},
        NO_ID       : {code: 102, msg: 'id字段不存在！'},
        BAD_AUTH    : {code: 103, msg: '用户名或者密码错误！'},
        BAD_UPLOAD  : {code: 104, msg: '该item已经上传过了！'},
        BAD_NAME    : {code: 105, msg: 'item必须有名字！'},
	},

    API         : {
	    UPLOAD  : '/upload',
        DELETE  : '/delete',
        UPDATE  : '/update',
        DOWNLOAD: '/download',
        SEARCH  : '/search',
    },
};

// 读取config目录下所有配置文件，并合并到system当中
fs.readdirSync(__dirname).forEach(fileName => {
	let stats = fs.statSync(path.join(__dirname, fileName));

	if (!stats.isDirectory() && fileName.startsWith(`${ENV}_`) && fileName.endsWith('.js')) {
		let key = fileName.replace(`${ENV}_`, '').replace('.js', '').toUpperCase();
		let value = require(path.join(__dirname, fileName));
		config.hasOwnProperty(key) ? _.merge(config[key], value) : (config[key] = value);
	}
});

module.exports = config;