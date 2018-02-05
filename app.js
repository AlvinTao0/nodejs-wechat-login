var express = require('express');
var request = require('request')
var path = require('path');
var fs = require('fs');
var qs = require('qs');
var {Url} = require('url');
var cookieParase = require('cookie-parser');

var wechatFirst = require('./wechatFirst.js');
var wechatApi = require('./wechatApi.js');
var config = require('./config.js');

var app = express();
//解析xml
app.use(cookieParase());
app.use(wechatApi);
app.use(express.static('dist'));

// 微信公众号后台第一次验证服务器时需要
// app.use('/', wechatFirst);

const getAccessToken = function () {
    let queryParams = {
        'grant_type': 'client_credential',
        'appid': config.wechat.appID,
        'secret': config.wechat.appSecret
    };

    let wxGetAccessTokenBaseUrl = 'https://api.weixin.qq.com/cgi-bin/token?'+qs.stringify(queryParams);
    let options = {
        method: 'GET',
        url: wxGetAccessTokenBaseUrl
    };
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
        if (res) {
            resolve(JSON.parse(body));
        } else {
            reject(err);
        }
        });
    })
};
//保存与更新
const saveToken = function () {
    getAccessToken().then(res => {
        let token = res['access_token'];
        fs.writeFile('./token', token, function (err) {
            if (err){
                console.log("fs.writeFile error:",err)
            }
        });
    })
};

const refreshToken = function () {
    saveToken();
    setInterval(function () {
        saveToken();
    }, 7000*1000);
};
refreshToken()

// 服务器
app.listen(5002, function() {
    console.log("app is listening ai port 5002");
})