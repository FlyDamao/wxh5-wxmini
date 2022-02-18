// 签名算法文件

const crypto = require('crypto');

var createNonceStr = function () {
  let nonceStr = Math.random().toString(36).substr(2, 15);
  console.log('=======创建nonceStr成功======');
  console.log('nonceStr::', nonceStr);
  console.log('==============endendend===========');
  return nonceStr;
};

var createTimestamp = function () {
  let timestamp = parseInt(new Date().getTime() / 1000) + '';
  console.log('=======创建timestamp成功======');
  console.log('timestamp::', timestamp);
  console.log('==============endendend===========');
  return timestamp;
};

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

// sha1加密
function sha1(str) {
  let shasum = crypto.createHash("sha1")
  shasum.update(str)
  str = shasum.digest("hex")
  return str
}

/**
* @synopsis 签名算法
*
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
*
* @returns
*/
var sign = function (jsapi_ticket, url) {
  var ret = {
    jsapi_ticket: jsapi_ticket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: url
  };
  var string = raw(ret);

  ret.signature = sha1(string)

  return ret;
};

module.exports = sign;
