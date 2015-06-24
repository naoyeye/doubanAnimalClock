/* 
* @Author: Jiyun
* @Date:   2015-06-25 03:35:03
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-06-25 04:12:42
*/

// jshint ignore:start

var express = require('express');

var request = require('request');
var schedule = require('node-schedule');
var session = require('express-session');
var everyauthCN = require('everyauth-cn');
everyauthCN.douban.scope('douban_basic_common,shuo_basic_w,shuo_basic_r');
var authSettings = require('./config/auth-settings');

var app = express();
app.set('views','cloud/views');// 设置模板目录
app.set('view engine', 'jade');

app.use(express.bodyParser());// 读取请求 body 的中间件

app.use(session({
    secret: 'everyauth-cn',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}));
app.use(everyauthCN.middleware());

everyauthCN.debug = false;

// 为字符串添加 repeat 方法:
// 判断是否存在这个方法
if (!String.repeat) {
    // 创建repeat方法
    String.prototype.repeat = function (l) {
        // 创建元素值为空、个数为重复次数+1的数组，用字符串自身做为分隔符连接起来，返回连接后的值。
        return new Array(l + 1).join(this);
    }
}

app.get('/', function (req, res) {

    // 判断是不是拿到了 token
    if (typeof req.session.auth !== 'undefined') {

        // 判断是不是豆瓣大笨鸡的 uid
        // todo 通过 config 增加多个帐号
        if (req.session.auth.douban.user.id === '67736974') {
            // 取得 token
            var accessToken = req.session.auth.douban.accessToken;

            // 定义自动定时任务的规则
            var rule = new schedule.RecurrenceRule();
            rule.minute = [0];


            // 调整时区
            var d = new Date(); //创建一个Date对象
            var localTime = d.getTime();
            var localOffset = d.getTimezoneOffset() * 60000; //获得当地时间偏移的毫秒数
            var utc = localTime + localOffset; //utc即GMT时间
            var offset = 8; //以北京时间为例，东8区
            var beijing = utc + (3600000 * offset);
            var date = new Date(beijing); // 得到最终的准确时间
            var now = date.getHours(); // 得到当前小时

            if (now === 0) {
                now = 24;
            }

            // console.log('now = ', now);

            var string = '咯~'; // todo: 多种文字形式 或者 支持前端页面中 input 传值？

            // 生成重复的字符串儿
            var text = '我是豆瓣大笨鸡，\r\n我正在练习报时，\r\n' + string.repeat(now);

            // 开始自动定时任务
            var autoTask = schedule.scheduleJob(rule, function () {
                postToDouban(accessToken, text, function (err, httpResponse, body) {
                    // todo: mail to me
                    // if (!err) {
                    //     console.log('豆瓣广播发布成功！偶也');
                    // } else {
                    //     console.error(error, body);
                    // }
                });
            });

            res.render('hello', {message: '欢迎豆瓣大笨鸡！'});
            return;

        } else {
            res.render('hello', {message: '骗谁呢？你根本不是豆瓣大笨鸡！'});
            return;
        }

    } else {
        res.render('hello', {message: '请问，你是豆瓣大笨鸡吗？'});
    }
});

// 发送豆瓣广播
function postToDouban (accessToken, text, callback) {
    var r = request.post('https://api.douban.com/shuo/v2/statuses/', {
            method: 'POST',
            headers: {'Authorization': 'Bearer ' + accessToken},
            timeout: 3000
        }, function (err, httpResponse, body) {
            if (callback && typeof callback === 'function') {
                callback(err, httpResponse, body);
            }
        });

    var form = r.form();
    form.append('text', text);
    // todo: 可增加配图
}

app.listen(8080);

// jshint ignore:end