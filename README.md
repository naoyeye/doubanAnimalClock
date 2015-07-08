
# 豆瓣动物报时 

## 需要在豆瓣网站里操作的：

1. 最好是注册一个豆瓣马甲
2. 申请豆瓣 API , 并把你的马甲账号加到测试账号里（用来在应用审核通过前测试用）

<img src="http://ww3.sinaimg.cn/large/ed133892jw1etvvtndq98j214k0kyabm.jpg" style="max-width:100%; width: 500px;" title="豆瓣大笨鸡img1" alt="豆瓣大笨鸡img1">
 
3. 记得勾选 API 权限

<img src="http://ww4.sinaimg.cn/large/ed133892jw1etvvtn7qooj20os0ysgnc.jpg" style="max-width:100%; width: 500px;" title="豆瓣大笨鸡img2" alt="豆瓣大笨鸡img2">

4. 记得填写应用地址和回调地址（本地测试期间，可以填 http://localhost:8080/ 和 http://localhost:8080/auth/douban/callback）

<img src="http://ww1.sinaimg.cn/mw690/ed133892jw1etvvtncupjj20yg10sdix.jpg" style="max-width:100%; width: 500px;" title="豆瓣大笨鸡img3" alt="豆瓣大笨鸡img3">


## clone 代码之后，需要做配置的：
1. doubanAnimalClock/cloud/config 目录中，重命名 auth-settings-example.js 为 auth-settings.js，然后修改其中的 80 行， `.myHostname('http://han.im')`改为你自己的应用网址，与之前在豆瓣填写的应用地址保持一致
2. 还是 doubanAnimalClock/cloud/config 目录，重命名 sns-config-example.js 为 sns-config.js，然后在 29 - 31 行填写你的 douban API  key、Secret和 redirect_uri 。redirect_uri 即为你之前在豆瓣填写的回调地址。修改43 - 45 行，填写你的 gmail 邮箱地址和密码用来发信，再填一个自己的其他的邮箱地址用来收信。
3. 修改 doubanAnimalClock/cloud/app.js 92 行 和 doubanAnimalClock/cloud/views/hello.jade 的 31 行， 替换为马甲的豆瓣 id


## 运行
`cd doubanAnimalClock`

`sudo npm install`

`node cloud/app.js`

如果有装了 supervisor，可以 `supervisor cloud/app.js`


浏览器里访问 http://localhost:8080/  ，登录豆瓣授权，完成。

如果想马上看效果，可以改 doubanAnimalClock/cloud/app.js 的 102 行，比如当前是凌晨 1:24:18 秒，我想测试1:25:00 能不能正常报时（正确的话应该会报凌晨1点），可以这么写：`rule.minute = [25];`即每小时的第25分钟，就发送报时广播。改了代码之后，记得重新在浏览器里刷新页面，登录豆瓣授权。