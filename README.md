# nodejs-wechat-login
- 基于cookie的微信网页登录前后端解决方案
- express mongodb 

# 思路
打开页面先调用是否登录接口，后台进行cookie验证
1. 如果验证成功，返回用户信息
2. 如果验证失败，做微信网页授权，后台拿到用户信息后存入数据库，并设置cookie，返回原页面

# 准备
为了本地服务启动后，直接可以测试，需要内网穿透，教程参考 [frp](http://www.sunnyrx.com/2016/10/21/simple-to-use-frp/)

# 开始

### 设置config.js

```js
/**
 * wechat: 微信公众号相关配置
 * homePage: 微信公众号托管的服务器域名
 */
var config = {
    wechat: {
        appID: "XXX",
        appSecret: "XXX",
        token: "XXX"
    },
    homePage: "http://XXXX/"
}
```

### 安装npm依赖

```js
npm install
```

### 启动
```js
npm run dev
```

### 访问
- 服务器启动服务：微信浏览器/手机 访问`config.js`配置的域名
- 本地启动服务：首先将本地服务映射到该域名，再同上