/**
 * @auth yangyufei
 * @time 2018-12-15 17:22:35
 * @desc 连接redis
 */
const Redis         = require('ioredis');

const config        = require('../config/index').REDIS;

if (!config) {
	console.error('找不到redis配置文件！');
	process.exit(1);
}

/**
 * 一个redis实例
 */
exports.getInstance = () => {
	let redis = Array.isArray(config) ? new Redis.Cluster(config) : new Redis(config);
	redis.on('error', err => {
		console.log('连接redis时发生错误！');
		console.error(err);
		process.exit(1);
	});
	
	return redis;
};