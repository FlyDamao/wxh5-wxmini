var express = require('express');
var router = express.Router();
var path = require('path');
const axios = require('axios');
const jsonfile = require('jsonfile');
const sign = require('../../libs/wechat-sign.js')

const wechatConfig = require('../../config/wechat');
const cacheConfig = require('../../config/cache');
const cacheConfigFile = path.join(__dirname, '../../config/cache.json')



/* let token = '22_TEissQnQi4G1tbiKXT8r1FNnNS6xSPs1Hz8x1Sp2BsTAAcK4hsPaZ0AUpyr-sSs0PAGr69wYSdRLsGGLrsayyiWHlN_jVx-RCZ7-5el_xz09djrqfRibWUn9TZdHurPyWv0zf6L95yUJbR3jHIBbAJAQRK'

let ticket = 'sM4AOVdWfPE4DxkXGEs8VNP-U4K55fbRJ280WPVKdS7k-szNhwioRPgeVsYA-gRB0x-odQgtxldJ-DJyqiaFXg' */

// console.log('getToken', getToken)


// 缓存时间戳、token、ticket
let cacheJSON = {
  time: "",
  token: "",
  ticket: ""
}
let expiresIn = (wechatConfig.expiresIn || 7200) * 1000;
let tokenTime = cacheConfig.time || 0;
let nowTime = Date.now();

// 设置时间戳为当前时间
cacheJSON.time = nowTime;

// 如果超过了失效时间
if ((nowTime - tokenTime) >= expiresIn) {
  // 1. 通过appid和appsecret获取 access token
  axios({
    method: 'GET',
    url: 'https://api.weixin.qq.com/cgi-bin/token',
    params: {
      'grant_type': 'client_credential',
      appid: wechatConfig.appid,
      secret: wechatConfig.secret
    }
  }).then(resToken => {
    // res data 示例
    // data: {
    //  access_token: '54_oVu9KsExYjABn2yZaGPtWltu8FHBkmiMQr7ypVYTU4DHiqAiG329R8Kj1ZRWvQCLWB_fT9NiUteVAz0BGmst7Z_UjaXrUFd1fCj5H_WdUpG4HOrPzQDRQj51Gn7xLSx_tSLG-hCHUOu_zk9aCJNbADAYFJ',
    //  expires_in: 7200
    // }
    console.log('resToken__data::',resToken.data);
    console.log('=======获取access token成功======')
    console.log('access_token::', resToken.data.access_token)
    console.log('==============endendend===========')
    let tokenData = resToken.data || {}
    let accessToken = tokenData.access_token
    // 缓存token
    cacheJSON.token = accessToken

    // 2. 获取 ticket
    axios({
      method: 'GET',
      url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
      params: {
        access_token: accessToken,
        type: 'jsapi'
      }
    }).then(resTicket => {
      // RES DATA 返回示例
      // data: {
      //   errcode: 0,
      //   errmsg: 'ok',
      //   ticket: 'LIKLckvwlJT9cWIhEQTwfKkUuVoEwnRd_UEg5JfmM6Rf38QeRUr5RuVoxLP5UlrM3pGj3r42MG3Eh6iEVuwYBg',
      //   expires_in: 7200
      // }
      console.log('=======获取js ticket成功======')
      console.log('js_ticket::', resToken.data.access_token)
      console.log('==============endendend===========')
      let ticketData = resTicket.data || {}
      let ticket = ticketData.ticket
      // 缓存ticket
      cacheJSON.ticket = ticket

      // 缓存数据至缓存文件
      jsonfile.writeFile(cacheConfigFile, cacheJSON, function (err) {
        if (err) console.error(err)
      });

      console.log('==========即将获取签名========')

      // 3. 签名
      router.get('/', function (req, res, next) {
		console.log('==========进入获取签名的函数========')
        let url = req.query.url
        let signature = sign(ticket, url);
        console.log('=======获取signature成功======');
        console.log('signature::', signature);
        console.log('==============endendend===========');
        signature.appId = wechatConfig.appid;
        res.json(signature)
      });

    });

  }).catch(err => {
    console.log(err)
  });
} else {
  // 缓存读取
  router.get('/', function (req, res, next) {
    let url = req.query.url || 'http://84iumr.natappfree.cc/pickup/'
    let signature = sign(cacheConfig.ticket, url);
    signature.appId = wechatConfig.appid
    res.json(signature)
  });

}

module.exports = router;
