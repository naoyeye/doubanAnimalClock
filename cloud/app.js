/* 
* @Author: Jiyun
* @Date:   2015-06-25 03:35:03
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-06-28 03:01:11
*/

// jshint ignore:start

var express = require('express');

var request = require('request');
var schedule = require('node-schedule');
var session = require('express-session');
var everyauthCN = require('everyauth-cn');
everyauthCN.douban.scope('douban_basic_common,shuo_basic_w,shuo_basic_r');
var conf = require('./config/sns-config');
var authSettings = require('./config/auth-settings');
var nodemailer = require('nodemailer');


var app = express();
app.set('views','cloud/views');// 设置模板目录
app.set('view engine', 'jade');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static('./public'));

// 如果打开这俩，应用重启后，还会保持登录状态
// 我觉得不太保险，所以注释掉了
// app.use(cookieParser());
// app.use(cookieSession({secret: 'doubananimalclock'}));

app.use(session({
    secret: 'everyauth-cn',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}));
app.use(everyauthCN.middleware());

everyauthCN.debug = false;




var now; // 当前是第几个小时
// var image; // 广播配图

// 为字符串添加 repeat 方法:
// 判断是否存在这个方法
if (!String.repeat) {
    // 创建repeat方法
    String.prototype.repeat = function (l) {
        // 创建元素值为空、个数为重复次数+1的数组，用字符串自身做为分隔符连接起来，返回连接后的值。
        return new Array(l + 1).join(this);
    }
}

// 创建邮件发送器
var smtpTransport = nodemailer.createTransport('SMTP',{
    service: 'Gmail',
    auth: {
        user: conf.mailer.user,
        pass: conf.mailer.pass
    }
});




app.get('/', function (req, res) {

    // 判断是不是拿到了 token
    if (typeof req.session.auth !== 'undefined') {

        // console.log('req.session = ', req.session);
        // console.log('req.session.auth.douban.user = ', req.session.auth.douban.user);

        // 判断是不是豆瓣大笨鸡的 uid
        // todo: 通过 config 增加多个帐
        // 68576413 是本地测试的一个帐号
        if (req.session.auth.douban.user.id === '67736974' || req.session.auth.douban.user.id === '68576413') {
            // 取得 token
            var accessToken = req.session.auth.douban.accessToken;
            var refresh_token = req.session.auth.douban.user.accessTokenExtra.refresh_token;

            // 提前获取广播配图
            // image = request.get('http://7bv90p.com1.z0.glb.clouddn.com/333.png');

            // 定义自动定时任务的规则
            var rule = new schedule.RecurrenceRule();
            rule.minute = [2]; // 会有延迟

            /* just for testing */
            // var text = generateText();
            // console.log(text);
            /* test */

            // 开始自动定时任务
            var autoTask = schedule.scheduleJob(rule, function () {

                var text = generateText();

                // console.log('text = ', text);

                postToDouban(accessToken, refresh_token, text, function (err, httpResponse, body) {
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


// 生成广播内容
function generateText () {
    // todo:
    // 多种文字形式 如：支持前端页面中 input 传值，或者通过 json 配置
    var string = '咯~';

    // 调整时区
    var d = new Date(); //创建一个Date对象
    var localTime = d.getTime();
    var localOffset = d.getTimezoneOffset() * 60000; //获得当地时间偏移的毫秒数
    var utc = localTime + localOffset; //utc即GMT时间
    var offset = 8; //以北京时间为例，东8区
    var beijing = utc + (3600000 * offset);
    var date = new Date(beijing); // 得到最终的准确时间
    now = date.getHours(); // 得到当前小时

    if (now === 0) {
        now = 24;
    }

    // 之前的版本
    // if (now < 12 && now > 6 || now === 6) {
    //     half = '早上';
    // } else if (now === 12) {
    //     half = '中午';
    // } else if (now > 12 && now < 18 || now === 18) {
    //     half = '下午';
    // } else if (now > 18 && now < 23 || now === 23) {
    //     half = '晚上';
    // } else if (now < 6) {
    //     half = '凌晨';
    // }
    // var text = half + now + '点: \r\n' + string.repeat(now);

    // 新版
    var text;
    var repeatString = string.repeat(now);

    // todo: 优化逻辑，减少 hardcode
    switch (now) {
        case 1:
            text = '凌晨1点。\r\n' + '呼~'.repeat(now);
            break;
        case 2:
            text = '凌晨2点。\r\n' + '呼~'.repeat(now);
            break;
        case 3:
            text = '凌晨3点。\r\n' + '啪~'.repeat(now);
            break;
        case 4:
            text = '凌晨4点。\r\n' + '呼~'.repeat(now);
            break;
        case 5:
            text = '凌晨5点。\r\n' + '呼~'.repeat(now);
            break;
        case 6:
            text = '早上6点。\r\n' + '呼~'.repeat(now);
            break;
        case 7:
            text = '早上7点。\r\n起床打卡。\r\n' + '噗~'.repeat(now);
            break;
        case 8:
            text = '早上8点。\r\n早餐打卡。\r\n' + '饿~'.repeat(now);
            break;
        case 9:
            text = '早上9点。\r\n和大笨鸭吵了一架。\r\n' + repeatString;
            break;
        case 10:
            text = '早上10点。\r\n想做一只猫。\r\n' + '喵~'.repeat(now);
            break;
        case 11:
            text = '早上11点。\r\n' + repeatString;
            break;
        case 12:
            text = '中午12点。\r\n无可奈何鸡睡去，\r\n似曾相识喵归来。\r\n' + '喵~'.repeat(now);
            break;
        case 13:
            text = '下午1点。\r\n' + string.repeat(1);
            break;
        case 14:
            text = '下午2点。\r\n' + string.repeat(2);
            break;
        case 15:
            text = '下午3点。\r\n' + '哼！'.repeat(3);
            break;
        case 16:
            text = '下午4点。\r\n' + string.repeat(4);
            break;
        case 17:
            text = '下午5点。\r\n' + '嗷~'.repeat(5);
            break;
        case 18:
            text = '下午6点。\r\n' + string.repeat(6);
            break;
        case 19:
            text = '晚上7点。\r\n' + string.repeat(7);
            break;
        case 20:
            text = '晚上8点。\r\n背单词打卡。\r\n' + string.repeat(8);
            break;
        case 21:
            text = '晚上9点。\r\n健身打卡。\r\n' + string.repeat(9);
            break;
        case 22:
            text = '晚上10点。\r\n跑步打卡。\r\n' + string.repeat(10);
            break;
        case 23:
            text = '晚上11点。\r\n晚安。\r\n' + '呼~'.repeat(11);
            break;
        case 24:
            text = '零点。\r\n' + '呼~'.repeat(12);
            break;
    }

    return text;
}

// 发送豆瓣广播
function postToDouban (accessToken, refresh_token, text, callback) {
    var r = request.post('https://api.douban.com/shuo/v2/statuses/', {
            method: 'POST',
            headers: {'Authorization': 'Bearer ' + accessToken},
            timeout: 3000
        }, function (err, httpResponse, body) {
            // 判断如果 106 错误 token 过期 (access_token_has_expired)
            // 则去刷新获取 token (refresh_token)
            if (err && err.code === 106) {
                console.error('HOT fuck！Clock fail! We need to refresh token!', err);
                // mailSender('紧急！豆瓣大笨鸡报时失败！需要重新授权！', err, function (mailError, mailResponse) {
                //     console.log('sender feecback:', mailError, mailResponse);
                // });

                refreshToken(refresh_token);

            } else if (err) {
                console.error('Fuck! Clock fail!, Error:', err, '\r\n Body:', body);
                mailSender('操！豆瓣大笨鸡报时失败！', err, function (mailError, mailResponse) {
                    console.log('Sender feedback:', mailError, mailResponse);
                });
            } else {
                console.log('LOL clock success!');
                // mailSender('哈哈！豆瓣大笨鸡报时成功！', text, function (mailError, mailResponse) {
                //     console.log('sender feecback:', mailError, mailResponse);
                // });
            }

            if (callback && typeof callback === 'function') {
                callback(err, httpResponse, body);
            }
        });

    var form = r.form();
    form.append('text', text);

    // // 22点 广播里增加一张配图
    // if (now === 22) {
    //     form.append('image', image);
    // }
    // // todo: 可增加配图
}

// 刷新获取 token
function refreshToken (refresh_token) {
    var client_id = conf.douban.apiKey;
    var client_secret = conf.douban.Secret;
    var redirect_uri = conf.douban.redirect_uri;

    request.post({
        url: 'https://www.douban.com/service/auth2/token?client_id=' + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirect_uri + '&grant_type=refresh_token&refresh_token=' + refresh_token,
    }, function (error, response, resBody) {
        if (!error && response.statusCode == 200) {
            // 拿到新的 access_token 和 refresh_token，再次发送豆瓣广播
            postToDouban(resBody.access_token, resBody.refresh_token, text, callback);
        } else {
            console.error('refresh_token fail！', error, resBody);
        }
    });
}

// 发送邮件
function mailSender (subject, text, callback) {
    console.log('sendMail...');
    var mailOptions = {
        from: '豆瓣大笨鸡 <'+ conf.mailer.user + '>',
        to: conf.mailer.recipient.join(','), // list of receivers
        subject: subject,
        text: text
    };

    smtpTransport.sendMail(mailOptions, function(mailError, mailResponse){
        if (callback && typeof callback === 'function') {
            callback(mailError, mailResponse);
        }
    });
}

app.listen(8080);

// jshint ignore:end