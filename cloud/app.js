/*global $, jQuery, ga, _, AV, FastClick, wx, campaignTools, Swiper, performance */

/* 
* @Author: Jiyun
* @Date:   2015-06-25 03:35:03
* @Last Modified by:   hanjiyun
* @Last Modified time: 2016-09-05 15:21:04
*/

// jshint ignore:start

var express = require('express');

var request = require('request');
var url = require('url');
var querystring = require('querystring');
// require('request-debug')(request);

var schedule = require('node-schedule');
var session = require('express-session');
// var everyauthCN = require('everyauth-cn');
var config = require('./config/app-config');
// everyauthCN.douban.scope(config.douban.scope);
// var authSettings = require('./config/everyauthCN/auth-settings');
var nodemailer = require('nodemailer');


var app = express();
app.set('views','cloud/views');
app.set('view engine', 'jade');

app.disable('x-powered-by');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static('./public'));


var curl = require('curlrequest');



// app.use(cookieParser());
// app.use(cookieSession({secret: 'doubananimalclock'}));


// app.use(session({
//     secret: 'doubananimalclock',
//     resave: false,
//     saveUninitialized: true,
//     // cookie: { secure: true }
// }));
// app.use(everyauthCN.middleware());

// everyauthCN.debug = true;




var date;
var now;
// var image;
var isLaunched = false;

var accessToken = null;
var refresh_token;
var currentUserId;

if (!String.repeat) {
    String.prototype.repeat = function (l) {
        return new Array(l + 1).join(this);
    }
}

console.log('====== start =====');


app.get('/', function (req, res) {

    if (accessToken) {

        if (config.userId.indexOf(currentUserId) >= 0) {

            // var accessToken = req.session.auth.douban.accessToken;
            // var refresh_token = req.session.auth.douban.user.accessTokenExtra.refresh_token;

            // image = request.get('http://7bv90p.com1.z0.glb.clouddn.com/333.png');

            /* just for testing */
            // var text = generateText();
            // console.log(text);
            /* test */

            if (!isLaunched) {
                var rule = new schedule.RecurrenceRule();
                rule.minute = [0, 60];

                var autoTask = schedule.scheduleJob(rule, function () {

                    var d = new Date();
                    var localTime = d.getTime();
                    var localOffset = d.getTimezoneOffset() * 60000;
                    var utc = localTime + localOffset;
                    var offset = 8;
                    var beijing = utc + (3600000 * offset);
                    date = new Date(beijing);
                    now = date.getHours();

                    var text = generateText();

                    postToDouban(accessToken, refresh_token, text, date, function (err, httpResponse, body) {
                        
                    });
                });

                isLaunched = true;
                
                res.render('hello', {currentUser: true, tryLogged: true, message: '欢迎大笨鸡，嘻嘻嘻嘻嘻！'});
            } else {
                res.render('hello', {currentUser: true, tryLogged: true, message: '欢迎大笨鸡，哈哈哈哈哈哈！'});
            }

        } else {
            res.render('hello', {currentUser: false, tryLogged: true,  message: '你不是大笨鸡，只有大笨鸡才能报时。'});
        }

    } else {
        res.render('hello', {currentUser: false, tryLogged: false, message: '你是大笨鸡吗？不是大笨鸡不要点下面的按钮。'});
    }
});

app.get('/auth/douban', function (req, res) {
    res.redirect('https://www.douban.com/service/auth2/auth?client_id=' + config.douban.apiKey + '&redirect_uri=' + config.douban.redirect_uri + '&response_type=code&scope=' + config.douban.scope);
});

app.get('/auth/douban/callback', function (req, res) {
    var parsedUrl = url.parse(req.url, true);
    
    if (!parsedUrl.query || !parsedUrl.query.code) {
        console.error("Missing code in querystring. The url looks like " + req.url);
        res.redirect('/');
        return;
    }

    var code = parsedUrl.query && parsedUrl.query.code;

    var oauth = {
        grant_type: 'authorization_code',
        code: code,
        client_id: config.douban.apiKey,
        client_secret: config.douban.Secret,
        redirect_uri: config.douban.redirect_uri
    };

    // get accessToken
    curl.request({
        url: 'https://www.douban.com/service/auth2/token',
        method: 'POST',
        data: oauth
    }, function (err, parts) {
        parts = parts.split('\r\n');
        var data = JSON.parse(parts.pop());

        accessToken = data.access_token;
        refresh_token = data.refresh_token;
        currentUserId = data.douban_user_id;

        // console.log('accessToken!!', data.access_token);

        res.redirect('/');

    });
});


app.get('/reAuth', function (req, res) {
    accessToken = null;
    refresh_token = null;
    currentUserId = null;

    res.redirect('/');
});

function generateText () {
    var string = '🐔';
    var text;

    if (now < 12 && now > 6 || now === 6) {
        half = '早上';
    } else if (now === 12) {
        half = '中午';
    } else if (now > 12 && now < 18 || now === 18) {
        half = '下午';
        now = now - 12;
    } else if (now > 18 && now < 23 || now === 23) {
        half = '晚上';
        now = now - 12;
    } else if (now < 6 && now > 0) {
        half = '凌晨';
    } else if (now === 0) {
        half = '午夜';
    }

    if (now !== 0) {
        text = half + now + '点。\r\n' + string.repeat(now);
    } else {
        text = half + now + '点。\r\n🌙😪💤';
    }

    return text;
}

function postToDouban (accessToken, refresh_token, text, date, callback) {
    request.post({
        url: 'https://api.douban.com/shuo/v2/statuses/',
        headers: {'Authorization': 'Bearer ' + accessToken},
        encoding: 'utf8',
        json: true,
        form: {text: text}
    }, function(err, httpResponse, body) {
        if (err && err.code === 106) {
            console.error(date + '\r\nHoly fuck! Clock fail! We need to refresh token!', err);

            refreshToken(refresh_token);
            console.log('===========');
        } else if (err || typeof body.code !== 'undefined') {
            console.error(date + '\r\nFuck! Clock fail!, Error:', err, '\r\n Body:', body);
            mailSender('FxxK dabenji!', body, function (mailError, mailResponse) {
                console.log('Sender feedback:', mailError, mailResponse);
            });
            console.log('===========');
        } else {
            console.log(date + '\r\nLOL clock success!');
            console.log('===========');
        }

        if (callback && typeof callback === 'function') {
            callback(err, httpResponse, body);
        }
    });

    // var r = request.post('https://api.douban.com/shuo/v2/statuses/', {
    //         method: 'POST',
    //         headers: {'Authorization': 'Bearer ' + accessToken, 'text': 'hello!!!'},
    //         timeout: 10000
    //     }, function (err, httpResponse, body) {
    //         if (err && err.code === 106) {
    //             console.error(date + '\r\nHOT fuck! Clock fail! We need to refresh token!', err);

    //             refreshToken(refresh_token);
    //             console.log('===========');
    //         } else if (err || typeof body.code !== 'undefined') {
    //             console.error(date + '\r\nFuck!Clock fail!, Error:', err, '\r\n Body:', body);
    //             mailSender('FxxK dabenji!', body, function (mailError, mailResponse) {
    //                 console.log('Sender feedback:', mailError, mailResponse);
    //             });
    //             console.log('===========');
    //         } else {
    //             console.log(date + '\r\nLOL clock success!');
    //             console.log('===========');
    //             console.log('body = ', body);
    //         }

    //         if (callback && typeof callback === 'function') {
    //             callback(err, httpResponse, body);
    //         }
    //     });

    // var form = r.form();
    // // form.append('text', text);
}

function refreshToken (refresh_token) {
    var client_id = config.douban.apiKey;
    var client_secret = config.douban.Secret;
    var redirect_uri = config.douban.redirect_uri;

    request.post({
        url: 'https://www.douban.com/service/auth2/token?client_id=' + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirect_uri + '&grant_type=refresh_token&refresh_token=' + refresh_token,
    }, function (error, response, resBody) {
        if (!error && response.statusCode == 200) {
            postToDouban(resBody.access_token, resBody.refresh_token, text, date, callback);
        } else {
            console.error(date + 'refresh_token fail!', error, resBody);
        }
    });
}


function mailSender (subject, text, callback) {
    if (!config.mailer.recipient || !config.mailer.user || !config.mailer.pass) {
        return;
    }

    console.log(date + 'sendMail...');
    var mailOptions = {
        from: 'dabenji <'+ config.mailer.user + '>',
        to: config.mailer.recipient.join(','), // list of receivers
        subject: subject,
        text: text
    };

    var smtpTransport = nodemailer.createTransport('SMTP',{
        service: 'Gmail',
        auth: {
            user: config.mailer.user,
            pass: config.mailer.pass
        }
    });

    smtpTransport.sendMail(mailOptions, function(mailError, mailResponse){
        if (callback && typeof callback === 'function') {
            callback(mailError, mailResponse);
        }
    });
}

app.listen(8181);

// jshint ignore:end