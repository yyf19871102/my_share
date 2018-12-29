/**
 * @author yangyufei
 * @date 2018-12-24 17:57:56
 * @desc
 */
const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const UserActionSchema = new Schema({
    _id     : String,
    user    : {type: String, ref: 'user'}, // 操作用户
    url     : {type: String}, // 密码
    method  : {type: String, default: 'GET'}, // 请求方法
    additional: {}, // 附加数据
    success : {type: Boolean, default: true}, // 操作是否成功
}, {collection: 'userAction'});

mongoose.model('userAction', UserActionSchema);