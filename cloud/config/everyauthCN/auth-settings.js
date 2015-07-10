/*global $, Modernizr, require, __dirname, module*/

var everyauth = require('everyauth-cn');
var config = require('./../app-config');

// debug mode
everyauth.debug = false;

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.uid = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}


var usersByDoubanId = {};


everyauth.everymodule
  // use `uid` instead of the default `id` as user authentication.
  .userPkey('uid')
  // use userid to query userinfo from db in real projects.
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

everyauth
  .douban
    .myHostname(config.homeUrl) // 你的应用地址
    .appId(config.douban.apiKey)
    .appSecret(config.douban.Secret)
    .handleAuthCallbackError( function (req, res) {
      res.redirect('/');
    })
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, doubanUserMetadata) {
      doubanUserMetadata.accessTokenExtra = accessTokenExtra; // 把 accessTokenExtra 里的 refresh_token 等信息加到 doubanUserMetadata进去
      
      return usersByDoubanId[doubanUserMetadata.id] ||
        (usersByDoubanId[doubanUserMetadata.id] = addUser('douban', doubanUserMetadata));
    })
    .redirectPath('/');

