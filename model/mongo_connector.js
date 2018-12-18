/**
 * @auth 杨羽飞
 * @time 2018-10-17 19:51:13
 * @desc 连接mongodb
 */
const Promise       = require('bluebird');
const mongoose      = require('mongoose');
const UUID          = require('uuid');

const dateFormat    = require('../common/date_format');
const SysConf       = require('../config');

const {ERROR_OBJ, MONGO} = SysConf;

if (!MONGO) {
	console.error('找不到mongo配置文件！');
	process.exit(1);
}

mongoose.Promise = Promise;
// 加载全局插件
mongoose.plugin(plugin);
mongoose.connect(MONGO.uri, MONGO.opt, function (err) {
	if (err) {
		console.error('connect to mongo error: ', err.message);
		process.exit(1);
	}
});

/**
 * 全局插件，主要是添加createdAt字段、updatedAt字段
 * @param schema
 * @param options
 */
function plugin(schema) {
	!schema.path('createdAt') && schema.add({createdAt: 'String'});
	!schema.path('updatedAt') && schema.add({updatedAt: 'String'});
	
	schema.pre('save', function(next){

		schema.path('createdAt') && (this.createdAt = dateFormat.getDate());
		
		this.updatedAt = dateFormat.getDate();
		
		!this._id && (this._id = UUID.v4());
		
		next();
	});
	
	
	schema.pre('update', function () {
		this.update({}, {$set: {updatedAt: dateFormat.getDate()}});
	});
	
	schema.pre('findOneAndUpdate', function () {
		this.findOneAndUpdate({}, {$set: {updatedAt: dateFormat.getDate()}});
	});
}