var express = require('express');
var request = require('request');
var router = express.Router();
var db = require('./db.js');
var config = require('./config.js');

router.get('/isLogin', function(req, res, next) {
    var data = {
        success: true,
        data: false
    }
    if (Object.keys(req.cookies).length === 0) {
        console.log("cookie没有openId，未登录");
        res.send(data);
    } else {
        // 从服务器查openId是否已经注册过
        var openId = req.cookies.openId;
        console.log(req.cookies, openId)
        if (openId) {
            var wherestr = {"openId": openId};
            console.log(wherestr)
            db.find(wherestr, function(err, user) {
                if (err) {
                    console.log("openId不对，未登录");
                    res.send(data);
                } else {
                    if (user.length == 0) {
                        console.log("openId不对，未登录");
                        res.send(data);
                        return;
                    }
                    console.log("已登录",user);
                    data.data = user;
                    res.send(data);
                }
            })
            
        } else {
            console.log("cookie没有openId，未登录");
            res.send(data);
        }
        
    }
})

router.get('/oauth/wx_login', function(req, res, next){
    // 第一步：用户同意授权，获取code
    // 这是编码后的地址
    var return_uri = encodeURIComponent(config.homePage + 'oauth/get_wx_access_token');
    var scope = 'snsapi_userinfo';
    res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+config.wechat.appID+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=null#wechat_redirect');
});


/* 获取access_token */
router.get('/oauth/get_wx_access_token', function(req,res, next){
    // 第二步：通过code换取网页授权access_token
    var code = req.query.code;
    var originUrl = req.query.state;
    request.get(
        {
            url:'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+config.wechat.appID+'&secret='+config.wechat.appSecret+'&code='+code+'&grant_type=authorization_code',
        },
        function(error, response, body){
            if(response.statusCode == 200){

                // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                var data = JSON.parse(body);
                var access_token = data.access_token;
                var openid = data.openid;
                console.log('openid' + openid);
                // 根据openId判断用户是否注册过
                var wherestr = {"openId": openid};
                db.find(wherestr, function(err, user) {
                    if (err) {
                        // 没有注册过
                        console.log("没有注册过")
                        register()
                    } else {
                        if (user.length == 0) {
                            console.log("没有注册过")
                            register()
                        } else {
                            console.log("注册过")
                            // 注册过，设置cookie，跳转
                            res.cookie('openId', openid, { maxAge: 900000 });
                            res.redirect('http://wechat.proxy.goldtao.cc/');
                        }
                        // console.log(user)
                        // var data = {
                        //     success: true,
                        //     data: user
                        // }
                        // res.send(data);
                    }

                    function register() {
                        request.get(
                            {
                                url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN',
                            },
                            function(error, response, body){
                                if(response.statusCode == 200){
        
                                    // 第四步：根据获取的用户信息进行对应操作
                                    var  userinfo = JSON.parse(body);
                                    //console.log(JSON.parse(body));
                                    console.log('获取微信信息成功！' + userinfo.nickname + userinfo.city + userinfo.country, userinfo.headimgurl);
                                    var json = userinfo;
                                    // 小测试，实际应用中，可以由此创建一个帐户
                                    // res.send("\
                                    //     <h1>"+userinfo.nickname+" 的个人信息</h1>\
                                    //     <p><img src='"+userinfo.headimgurl+"' /></p>\
                                    //     <p>"+userinfo.city+"，"+userinfo.province+"，"+userinfo.country+"</p>\
                                    // ");
                                    // 保存用户信息
                                    var createDate = new Date();
                                    var userObj = {
                                        openId: openid,
                                        createDate: createDate,
                                        name: userinfo.nickname,
                                        place: userinfo.city+userinfo.province+userinfo.country,
                                        image: userinfo.headimgurl
                                    }
                                    db.create(userObj, function(err) {
                                        if (err) {
                                            return console.log(err);
                                        } else {
                                            // 创建用户成功，设置cookie
                                            res.cookie('openId', openid, { maxAge: 900000});
                                            res.redirect(config.homePage);
                                        }
                                    })
        
                                }else{
                                    console.log(response.statusCode);
                                }
                            }
                        );
                    }
                })
                
            }else{
                console.log(response.statusCode);
            }
        }
    );
});

module.exports = router;