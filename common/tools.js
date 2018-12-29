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
const {DEFAULT}     = ERROR_OBJ;

/**
 * 抛出指定异常
 * @param errObj
 * @param errMsg
 * @param errData
 */
exports.threw = (errObj = ERROR_OBJ.DEFAULT, errMsg = '', errData = {}) => {
	let code = errObj.code && !isNaN(errObj.code) ? errObj.code : ERROR_OBJ.DEFAULT.code;
	let msg = errMsg || errObj.msg || ERROR_OBJ.DEFAULT.msg;

	let err = new Error(msg);
	err.code = code;
	err.data = errData;

	throw err;
};

/**
 * 将err对象转换成为response数据
 * @param err
 * @returns {{code: (*|number), msg: (*|string), data: (*|{})}}
 */
exports.getResFromError = err => {
    return {code: err.code || DEFAULT.code, msg: err.message || DEFAULT.msg, data: err.data || {}};
};

/**
 * 返回成功对象
 * @param msg
 * @param data
 * @returns {{code: number, msg: (*|string), data: (*|{})}}
 */
exports.getSuccessRes = (msg, data) => {
    return {
        code    : ERROR_OBJ.SUCCESS.code,
        msg     : msg || ERROR_OBJ.SUCCESS.msg,
        data    : data || {}
    }
};