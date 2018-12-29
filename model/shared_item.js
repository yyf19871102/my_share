/**
 * @author yangyufei
 * @date 2018-12-21 19:56:42
 * @desc
 */
const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;
const _         = require('lodash');

const SysConf   = require('../config');
const {CFG, API}= SysConf;

const SharedItemSchema = new Schema({
    _id     : String,   // 就是共享文件名称
    version : String,   // 版本
    tags    : [String], // 标签
    desc    : String,   // 描述
    readme  : String,   // 一般是安装文档
    category: {type: String, enum: SysConf.CATEGORY}, // 用途类型
    storageType: {type: String, enum: SysConf.STORAGE_TYPE}, // 存储类型
    isCompressed: {type: Boolean, default: false}, // 是否压缩
    size    : Number, // 大小
    postBy  : {type: String, ref: 'user', default: 'root'}, // 上传者
    like    : [{type: String, ref: 'user'}], // 点赞人
    unLike  : [{type: String, ref: 'user'}], // 踩得人
    status  : {type: String, default: SysConf.STATUS.ACTIVE}, // 状态
}, {collection: 'sharedItem'});

// 下载地址
SharedItemSchema.virtual('downloadUrl').get(function () {
    return `http://${CFG.host}:${CFG.port}${API.DOWNLOAD}/${this._id}`
});

mongoose.model('sharedItem', SharedItemSchema);