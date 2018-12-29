/**
 * @author yangyufei
 * @date 2018-12-21 20:13:37
 * @desc 用户表
 */
const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;
const _         = require('lodash');

const {STATUS}  = require('../config');

const UserSchema = new Schema({
    _id     : String,
    name    : {type: String, unique: true, index: true, required: true}, // 用户名
    password: {type: String, default: 'CMCC10086'}, // 密码
    email   : String, // 邮箱
    isRoot  : {type: Boolean, default: false}, // root权限
    status  : {type: Number, default: STATUS.ACTIVE}, // 用户状态
}, {collection: 'user'});

mongoose.model('user', UserSchema);