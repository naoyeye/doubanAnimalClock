/* 
* @Author: Jiyun
* @Date:   2015-06-25 03:35:03
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-06-25 16:42:41
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


            var text = generateText();

            console.log(text);

            // 开始自动定时任务
            var autoTask = schedule.scheduleJob(rule, function () {



                // postToDouban(accessToken, text, function (err, httpResponse, body) {
                //     // todo: mail to me
                //     // if (!err) {
                //     //     console.log('豆瓣广播发布成功！偶也');
                //     // } else {
                //     //     console.error(error, body);
                //     // }
                // });
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
    var string = '咯~'; // todo: 多种文字形式 或者 支持前端页面中 input 传值？

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

    // now = 12;
    var text;
    var repeatString = string.repeat(now);

    switch (now) {
        case 1:
            text = '凌晨1点整。\r\n你还不睡吗？在干嘛类？\r\n' + repeatString;
            break;
        case 2:
            text = '凌晨2点整。\r\n哎呀！好饿！！\r\n' + '饿~'.repeat(now);
            break;
        case 3:
            text = '凌晨3点整。\r\n此刻，我只想做一只猫！\r\n' + '喵~'.repeat(now);
            break;
        case 4:
            text = '凌晨4点整。\r\n让我的啼声划破这黎明前的黑暗！\r\n' + repeatString;
            break;
        case 5:
            text = '凌晨5点整。\r\n快给我喂食！\r\n' + repeatString;
            break;
        case 6:
            text = '早上6点整。\r\n快起床！\r\n' + '嗷~'.repeat(now);
            break;
        case 7:
            text = '早上7点整。\r\n' + repeatString;
            break;
        case 8:
            text = '早上8点整。\r\n煎饼果子豆浆油条包子老豆腐！\r\n' + repeatString;
            break;
        case 9:
            text = '早上9点整。\r\n我在思念我的床，她一定也很孤独。\r\n' + repeatString;
            break;
        case 10:
            text = '早上10点整。\r\n我爱蒋大为！\r\n' + repeatString;
            break;
        case 11:
            text = '早上11点整。\r\n体力不..支..了...\r\n' + repeatString;
            break;
        case 12:
            text = '中午12点整。\r\n吃饱喝足。\r\n' + repeatString;
            break;
        case 13:
            text = '下午1点整。\r\n有人说我是机器鸡，T_T。\r\n' + repeatString;
            break;
        case 14:
            text = '下午2点整。\r\n哎呦？窗外的风景不错哦。\r\n' + repeatString;
            break;
        case 15:
            text = '下午3点整。\r\n都没人跟我表白！\r\n' + '哼！'.repeat(now);
            break;
        case 16:
            text = '下午4点整。\r\n好累哦~\r\n' + repeatString;
            break;
        case 17:
            text = '下午5点整。\r\n快下班啦！\r\n' + '嗷~'.repeat(now);
            break;
        case 18:
            text = '下午6点整。\r\n回家路上要小心。\r\n' + repeatString;
            break;
        case 19:
            text = '晚上7点整。\r\n终于回到我的鸡窝了。\r\n' + repeatString;
            break;
        case 20:
            text = '晚上8点整。\r\n吃饭，背单词，打卡。\r\n' + repeatString;
            break;
        case 21:
            text = '晚上9点整。\r\n我去跑步了。\r\n' + repeatString;
            break;
        case 22:
            text = '晚上10点整。\r\n睡了，晚安。\r\n' + '呼~'.repeat(now);
            break;
        case 23:
            text = '晚上11点整\r\n' + '呼~'.repeat(now);
            break;
        case 24:
            text = '呼~'.repeat(now);
            break;
    }

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

    // 生成重复的字符串儿
    // var text = half + now + '点整: \r\n' + string.repeat(now);

    return text;
}

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