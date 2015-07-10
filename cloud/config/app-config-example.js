/*global $, Modernizr, require, __dirname, module, mailer*/

/* 
* @Author: Jiyun
* @Date:   2015-07-10 18:12:00
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-07-10 18:56:59
*/

module.exports = {
    userId: ['11111', '111111'], // 可以用来登录的豆瓣帐号 id
    homeUrl: 'http://xxxxx', // 你的应用主页，跟豆瓣 API 中填写的保持一致
    douban: {
        apiKey: 'ssss',
        Secret: 'ssss',
        redirect_uri: 'http://xxxxx/auth/douban/callback', // 跟豆瓣 API 中填写的保持一致。后面必须是 auth/douban/callback
        scope: 'douban_basic_common,shuo_basic_w,shuo_basic_r' // 跟豆瓣 API 中选择的保持一致，建议选这三个
    },

    // user pass recipient 任意一项不填，都可以关闭邮件发送
    mailer: {
        user: 'yourGmail@gmail.com', // 必须是 gmail
        pass: 'yourGmailPassword',
        recipient: ['yourAnotherMail@xxxx.xx'] // 另一个你自己的邮箱，用来接报时收报错信息
    }
};