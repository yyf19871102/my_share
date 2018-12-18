/**
 * @author yangyufei
 * @date 2018-12-17 19:53:31
 * @desc
 */
const express   = require('express');
const bodyParser= require('body-parser');

const router    = require('./controller');
const logger    = require('./common/logger');
const SysConf   = require('./config');

const app = express();

app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

app.use('/', router);

app.listen(SysConf.CFG.PORT, function () {
    logger.info('MYSHARE listening on port', SysConf.CFG.PORT);
    logger.info('');
});