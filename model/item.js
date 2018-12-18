/**
 * @author yangyufei
 * @date 2018-12-17 19:04:46
 * @desc
 */
const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const ItemSchema = new Schema({
    _id     : String,
    name    : String,
    tags    : [String],
    desc    : String,
}, {collection: 'item'});

mongoose.model('item', ItemSchema);