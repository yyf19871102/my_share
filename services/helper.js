/**
 * @author yangyufei
 * @date 2018-12-25 08:56:45
 * @desc
 */
const _         = require('lodash');

const PREFIX    = `myShare`;

exports.getSessionKey = sessionId => `${PREFIX}:session:${sessionId}`;

exports.getUserKey = userId => `${PREFIX}:user:${userId}`;

exports.getItemKey = itemId => `${PREFIX}:item:${itemId}`;

exports.sortObject = object => {
    let keys = _.sortBy(_.keys(object));

    let res = {};
    keys.forEach(key => {res[key] = object[key]});

    return res;
};

exports.getUserQueryKey = query => `${PREFIX}:user-query:${JSON.stringify(query)}`;

exports.getItemQueryKey = query => `${PREFIX}:item-query:${JSON.stringify(query)}`;

exports.getActionQueryKey = query => `${PREFIX}:action-query:${JSON.stringify(query)}`;