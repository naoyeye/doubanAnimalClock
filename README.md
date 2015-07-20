
# 豆瓣动物报时 

## 需要在豆瓣网站里操作的：

1. 最好是注册一个豆瓣马甲
2. 申请豆瓣 API , 并把你的马甲账号加到测试账号里（用来在应用审核通过前测试用）

<img src="http://ww3.sinaimg.cn/large/ed133892jw1etvvtndq98j214k0kyabm.jpg" style="max-width:100%; width: 500px;" title="豆瓣大笨鸡img1" alt="豆瓣大笨鸡img1">
 
3. 记得勾选 API 权限

<img src="http://ww4.sinaimg.cn/large/ed133892jw1etvvtn7qooj20os0ysgnc.jpg" style="max-width:100%; width: 500px;" title="豆瓣大笨鸡img2" alt="豆瓣大笨鸡img2">

4. 记得填写应用地址和回调地址（本地测试期间，可以填 http://localhost:8181/ 和 http://localhost:8181/auth/douban/callback）

<img src="http://ww1.sinaimg.cn/mw690/ed133892jw1etvvtncupjj20yg10sdix.jpg" style="max-width:100%; width: 500px;" title="豆瓣大笨鸡img3" alt="豆瓣大笨鸡img3">


## clone 代码之后，需要做配置的：
1. doubanAnimalClock/cloud/config 目录中，重命名 app-config-example.js 为 app-config.js
2. 修改 app-config.js 里的 userId 为豆瓣马甲的 id，如果是多个帐号共用，写为数组形式；修改 homeUrl 为你的应用地址，最后不要加 / ; 填写你的 douban api key 和 secret、回调地址、scope（即之前勾选的 API 权限）；填写 mailer 中的三项内容，如果不想接收邮件提醒，可以留空。


## 运行
`cd doubanAnimalClock`

`sudo npm install`

`node cloud/app.js`

如果有装了 supervisor，可以 `supervisor cloud/app.js`


浏览器里访问 http://localhost:8181/  ，登录豆瓣授权，完成。

如果想马上看效果，可以改 doubanAnimalClock/cloud/app.js 的 rule.minute 的设置， ，比如当前是凌晨 1:24:18 秒，想测试1:25:00 能不能正常报时（正确的话应该会报凌晨1点），可以这么写：`rule.minute = [25];`即每小时的第25分钟，发送报时广播。

改了代码之后，记得重新在浏览器里刷新页面，登录豆瓣授权。

