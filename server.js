const express = require("express"); //加载express框架
const mysql = require("mysql"); // 加载连接数据库
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const moment = require('moment');


const artTemplate = require("art-template"); // 加载静态模板插件
const express_template = require("express-art-template"); // 

const app = express();

let options = {
    name: 'SESSIONID',  
    // session会话名称存储在cookie中的键名
    secret: '%#%￥#……%￥', // 必填项，用户session会话加密（防止用户篡改cookie）
    cookie: {  //设置session在cookie中的其他选项配置
        path: '/',
        secure: false,  //默认为false, true 只针对于域名https协议
        maxAge: 60000 * 24,  //设置有效期为24分钟，说明：24分钟内，不访问就会过期，如果24分钟内访问了。则有效期重新初始化为24分钟。
    }
}

app.use(session(options));


app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/static", express.static(__dirname + "/static"));

// 配置模板引擎
app.set("views", __dirname + "/views/");
app.engine("html", express_template);
app.set("view engine", "html")

// 定义一个过滤器
artTemplate.defaults.imports.dateFormat = function(time,format = 'YYYY-MM-DD HH:mm:ss'){
    return moment.unix(time).format(format);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 挂载路由中间件
const router = require("./router/router.js");
const frontRouter = require('./router/frontRouter.js')
const { userInfo } = require("os");

// 允许跨域请求
app.use(function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*")
    next();
})

// 前端api路由中间件
app.use('/api',frontRouter)

app.use((req,res,next)=>{
    let path = req.path.toLocaleLowerCase();
    let unPermissionPath = ['/login','/logout','/dologin','/register','/goregister'];
    if(!unPermissionPath.includes(path)){
        if(req.session.userfoin){
            next();
        }else{
            res.redirect("/login");
            return;
        }
    }else{
        next();
    }
})

// 后端路由中间件
app.use(router);

app.listen(5000, () => {
    console.log("server is running at port 5000");
});