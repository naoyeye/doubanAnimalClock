// jshint ignore:start 

// 在 Cloud code 里初始化 Express 框架
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

// 为字符串添加 repeat 方法
if(!String.repeat){//判断是否存在这个方法
    String.prototype.repeat = function(l){//创建repeat方法
        return new Array(l + 1).join(this);//创建元素值为空、个数为重复次数+1的数组，用字符串自身做为分隔符连接起来，返回连接后的值。
    }
}

// // 使用 Express 路由 API 服务 / 的 HTTP GET 请求
app.get('/', function(req, res) {



    // 判断是不是拿到了 token
    if (typeof req.session.auth !== 'undefined') {
        // 判断是不是豆瓣大笨鸡的 uid

        // console.log(req.session.auth.douban.user);

        if (req.session.auth.douban.user.uid === '67736974') {
            var accessToken = req.session.auth.douban.accessToken;

            var rule = new schedule.RecurrenceRule();
            rule.minute = [0];

            // var chi = [];
            var now = new Date().getHours();
            var text = '咯~';

            if (now === 0) {
                now = 24;
            }

            // console.log('text 1 = ', text.repeat(now));
            text = text.repeat(now);
            // console.log('text 2 = ', text);

            var autoTask = schedule.scheduleJob(rule, function(){

                // console.log('text 1 = ', now * text);
                // text = now * text;
                // console.log('text 2 = ', text);

                postToDouban(accessToken, text, function (err, httpResponse, body) {
                    console.log('豆瓣广播发布成功！偶也');
                    // res.render('hello', {message: '发布成功'});
                    // res.json({error:err, message: null, data: JSON.parse(body)});
                });
            });

            res.render('hello', {message: '欢迎豆瓣大笨鸡！'});
        } else {
            res.render('hello', {message: '你不是豆瓣大笨鸡！'});
            return;
        }


    } else {
        // res.render('hello', {friends: 10});
        res.render('hello', {message: '需要用豆瓣大笨鸡的账号登录'});
    }

    
});

// 发送豆瓣广播
function postToDouban (accessToken, text, callback) {
    var r = request.post('https://api.douban.com/shuo/v2/statuses/', {
            method: 'POST',
            headers: {'Authorization': 'Bearer ' + accessToken},
            timeout: 3000
        }, function (err, httpResponse, body) {
            // console.log('body', body);
            if (callback && typeof callback === 'function') {
                callback(err, httpResponse, body);
            }
        });

    var form = r.form();
    form.append('text', text);
}




// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen(80);

// /* jshint ignore:end */