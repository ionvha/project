const express = require("express"); //加载express框架
const mysql = require("mysql"); // 加载连接数据库
const fs = require("fs");
const path = require("path");
const multer = require("multer");


const router = express.Router();
const upload = multer({dest:"uploads/"}) //设置上传的目录，会自动创建

const dbConfing = require("../config/dbconfig.js")
const dbQueryPromise = require('../model/query-promise');
// const app = express();
var connection = mysql.createConnection(dbConfing);

connection.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("连接到MYSQL")
})



//导入控制器模块 
const ArticleController = require("../controller/ArticleController.js");
const UserController = require("../controller/UserController.js");
const ClassifyController = require("../controller/ClassifyController.js");
const indexController = require('../controller/indexController.js')
const dbQuery = require("../model/query.js");
const { runInContext } = require("vm");

// 首页
router.get('/',indexController.index)


// 首页后台数据
router.get('/cateArticleCount', indexController.cateArticleCount)


// 文章列表
router.get("/article",ArticleController.article);

// 文章详情
router.get("/detail",ArticleController.detail);

// 文章添加页面
router.get("/add",ArticleController.add);

// 富文本列表
router.get('/editContent',ArticleController.editContent)

// 富文本入库
router.post('/updataArtContent',ArticleController.updataArtContent)

// 文章添加操作数据库
router.post("/insert",upload.single("picture"),ArticleController.insert);

// 文章删除 
router.get("/delete",ArticleController.delete);

// ajax文章删除
router.post('/ajaxdelete',ArticleController.ajaxdelete)

// 文章编辑回显
router.get("/edit",ArticleController.edit);

// 文章编辑更新
router.post("/update",upload.single("picture"),ArticleController.update);

// 加入回收站
router.get("/recyclek",ArticleController.recyclek);

// ajax加入回收站
router.post("/ajaxrecyclek",ArticleController.recyclek);

// 回收站列表
router.get("/recycleks",ArticleController.recycleks);

// 用户登录
router.get("/login",UserController.login); 

// 用户登录验证 
router.post("/dologin",UserController.dologin);

// 用户登录验证 
router.get("/logout",UserController.logout);

// 用户注册页面
router.get("/register",UserController.register);

// 用户注册 
router.post("/goregister",UserController.goregister);

// ajax头像更新
router.post('/head',upload.single('file'),UserController.head);

// 更新密码 
router.post('/updatePassword',UserController.updatePassword);

// 分类列表
router.get("/classify",ClassifyController.classify);

// 添加分类列表
router.get("/classifyAdd",ClassifyController.classifyAdd);

// 添加分类操作
router.post('/classifyInsert', upload.single(''), ClassifyController.classifyInsert);

// 分类列表数据
router.get('/classifyData',ClassifyController.classifyData);

// 分类删除操作
router.post('/classifydelete',ClassifyController.classifydelete);

// 文章分页数据
router.get('/articleCount',ArticleController.articleCount);

module.exports = router;
