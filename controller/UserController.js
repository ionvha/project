
const dbQuery = require('../model/query.js');
const fs = require('fs');
const path = require('path');
const dbQueryPromise = require('../model/query-promise.js');
const CryptoJS = require('crypto-js');
let { secret } = require('../config/config.js');

const UserController = {};

// 登录页面
UserController.login = (req, res) => {
    res.render("login.html");
}

// 登录操作数据库
UserController.dologin = (req, res) => {
    let { username, password } = req.body;
    password = CryptoJS.MD5(`${password}${secret}`).toString();
    let sql = `select * from user where username = '${username}' and password = '${password}'`;
    dbQuery(sql, (err, rows) => {
        if (rows.length > 0) {
            let userfoin = rows[0];
            req.session.userfoin = JSON.stringify(userfoin);
            // res.send("<script>alert('成功登录');location.href = '/';</script>")
            res.json({ number: 11, status: '正确' });
        } else {
            // res.send("<script>alert('用户名或密码错误');location.href = '/login';</script>")
            res.json({ number: 22, stauts: '错误' })
        }
    })
}

// 退出操作
UserController.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
    })
    res.redirect("/login");
}

// 用户注册页面
UserController.register = (req, res) => {
    res.render("register.html",);
}

// 用户注册操作数据库接口
UserController.goregister = (req, res) => {
    let { username, password } = req.body;
    password = CryptoJS.MD5(`${password}${secret}`).toString();
    let sql = `insert into user(username,password) values ('${username}','${password}')`;
    dbQuery(sql, (err, result) => {
        console.log(result)
        if (result.affectedRows) {
            res.send("<script>alert('注册成功');location.href='/';</script>")
        } else {
            res.send("<script>alert('注册失败');location.href='/register';</script>")
        }
    })
}

// 用户更新密码操作
UserController.updatePassword = (req,res) => {
    let {oldpwd,newpwd} = req.body;
    let {user_id} = JSON.parse( req.session.userfoin )
    let sql = `select password from user where user_id = ${user_id}`
    dbQuery(sql,(err,result)=>{
        if(result.length){
            oldpwd = CryptoJS.MD5(`${oldpwd}${secret}`).toString();
            if( result[0].password !== oldpwd ){
                res.json({
                    code: -1,
                    message: "原密码输入错误"
                })
            }else{
                newpwd = CryptoJS.MD5(`${newpwd}${secret}`).toString();
                let sql = `update user set password = '${newpwd}' where user_id = ${user_id}`
                dbQuery(sql,(err,result)=>{
                    if(result.affectedRows){
                        res.json({
                            code:20000,
                            message: '密码更新成功'
                        })
                    }else{
                        res.json({
                            code:-2,
                            message: '服务器繁忙，请稍后再试'
                        })
                    }
                })
            }
        }
    })
}

// 用户头像ajax更新
UserController.head = (req,res)=>{
    let {picture} = JSON.parse(req.session.userfoin);
    let imgPath = '';
    if(req.file){
        let {originalname,filename} = req.file;
        let ext = originalname.substring( originalname.indexOf("."));
        let oldPath = path.join(__dirname,"../","/uploads",filename);
        let newPath = path.join(__dirname,"../","/uploads",filename) + ext;
        imgPath = `/uploads/${filename}${ext}`;
        fs.renameSync(oldPath,newPath);
    }
    let userfoin =JSON.parse( req.session.userfoin );
    let {user_id} = userfoin;
    let sql = `update user set picture = '${imgPath}' where user_id = '${user_id}'`
    dbQuery(sql,(err,result)=>{
        if(result.affectedRows){
            picture = path.join(__dirname,'../',picture);
            console.log(picture)
            fs.unlink(picture,function(){
                console.log('删除成功')
            });
            userfoin.picture = imgPath;
            req.session.userfoin = JSON.stringify(userfoin)
            res.json({
                code: 20000,
                message: 'ok',
                imgPath:imgPath
            })
        }
    })
}

module.exports = UserController;