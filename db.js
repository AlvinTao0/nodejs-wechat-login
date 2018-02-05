var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodejs-wechat-login');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.on('open', function(callback) {
    console.log('yay!')
})

var Schema = mongoose.Schema;
var user = new Schema({
    openId: String,
    createDate: Date,
    image: String,
    name: String,
    place: String
})

var userModel = mongoose.model('User', user);

module.exports = userModel;