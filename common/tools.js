/**
 * @auth yangyufei
 * @date 2018-12-15 17:22:35
 * @desc 工具集合
 */
const fs            = require('fs');
const path          = require('path');
const _             = require('lodash');
const Promise       = require('bluebird');

const logger        = require('./logger');
const config        = require('../config');
const {ERROR_OBJ}   = config;

/**
 * 抛出指定异常
 * @param errObj
 * @param errMsg
 * @param errData
 */
exports.threw = (errObj = ERROR_OBJ.DEFAULT, errMsg = '', errData = {}) => {
	let code = errObj.code && !isNaN(errObj.code) ? errObj.code : ERROR_OBJ.DEFAULT.code;
	let msg = errObj.msg || ERROR_OBJ.DEFAULT.msg;

	let err = new Error(msg);
	err.code = code;
	err.data = errData;

	throw err;
};