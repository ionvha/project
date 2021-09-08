const mysql = require('mysql');
const fs = require('fs')
const path = require('path')

const ArticleController = {}

const dbQuery = require('../model/query.js');
const dbQueryPromise = require('../model/query-promise');

let audits = {
    0:"待审核",
    1:"审核通过",
    2:"审核失败"
}

// 文章列表
ArticleController.index = (req,res)=> {
    let userfoin = JSON.parse(req.session.userfoin || '{}');
    let sql = "select t1.*,t2.bookTitle from library_content as t1 left join library_classifys as t2 on t1.cat_id = t2.id where if_recyclek = 1 order by t1.id desc ;";
    dbQuery(sql,(err,rows)=>{
        let data = rows.map((item) => {
            item.audit = audits[item.audit];
            return item;
        })
        res.render("index.html",{articles:data,userfoin});
    })
}

// 文章添加页面
ArticleController.add = (req,res)=> {
    let userfoin = JSON.parse(req.session.userfoin || '');
    let sql = "select * from library_classifys";
    dbQuery(sql,(err,rows)=>{
        res.render("add.html",{classif:rows,userfoin})
    })
}

// 文章添加操作数据库
ArticleController.insert = (req,res)=>{
    // console.log(req.body);
    let imgPath = '';
    if(req.file){
        let {originalname,filename} = req.file;
        let ext = originalname.substring( originalname.indexOf("."));
        let oldPath = path.join(__dirname,"../","./uploads",filename);
        let newPath = path.join(__dirname,"../","./uploads",filename) + ext;
        imgPath = `./uploads/${filename}${ext}`;
        fs.renameSync(oldPath,newPath);
    }
    let {title,author,id,content} = req.body;
    let sql = `insert into library_content(title,author,cat_id,content,picture) values ("${title}","${author}","${id}","${content}","${imgPath}")`;
    dbQuery(sql,(err,result)=>{
        if(result.affectedRows){
            res.send("<script>alert('添加成功');location.href='/';</script>")
        }else{
            res.send("<script>alert('添加失败');location.href='/';</script>")
        }
    })
}

// 富文本文章列表
ArticleController.editContent = (req,res) => {
    let userfoin = JSON.parse(req.session.userfoin || "");
    res.render('editContent.html',{userfoin});
}

// 富文本添加入库
ArticleController.updataArtContent = async (req,res) => {     
    let {id,content} = req.body;
    let sql = `update library_content set content = '${content}' where id = '${id}'`;
    let result = await dbQueryPromise(sql);
    res.json({
        code: 20000,
        message: '编辑文章成功'
    })
}

// 文章删除 
ArticleController.delete = (req,res)=>{
    let {id,picture} = req.query;
    let sql = `delete from library_content where id = ${id}`;
    dbQuery(sql,(err,result)=>{
        if(result.affectedRows){
            if(picture){
                let oldpath = path.join(__dirname,"../",picture);
                fs.unlink(oldpath, (err)=>{
                    // 静默
                    // console.log('删除成功')
                })
            }
            res.send("<script>alert('删除成功'); location.href = '/'; </script>")
        }else{
            res.send("<script>alert('删除失败'); location.href = '/'; </script>")
        }
    })
}

// ajax文章删除
ArticleController.ajaxdelete = (req,res)=>{
    let {id,picture} = req.body;
    let sql = `delete from library_content where id = ${id}`;
    dbQuery(sql,(err,result)=>{
        if(result.affectedRows){
            if(picture){
                let oldpath = path.join(__dirname,"../",picture);
                fs.unlink(oldpath, (err)=>{
                    // 静默
                    // console.log('删除成功')
                })
            }
            // res.send("<script>alert('删除成功'); location.href = '/'; </script>");
            res.json({
                code:20000,
                message:'删除成功'
            })
        }else{
            res.send("<script>alert('删除失败'); location.href = '/'; </script>")
            res.json({
                code:-1,
                message:'删除失败'
            })
        }
    })
}

// 文章编辑回显
ArticleController.edit = (req,res)=>{
    let {id} = req.query;

    let sql1 = `select * from library_content where id = ${id}`;
    dbQuery(sql1,(err,rows1)=>{
        let sql2 = "select * from library_classifys";
        dbQuery(sql2,(err,rows2)=>{
            res.render("edit.html",{article:rows1[0],cats:rows2})
        })
    })
}

// 文章编辑更新
ArticleController.update = (req,res)=>{
    let {id,title,author,content,status,cat_id,oldImg} = req.body;
    let imgPath;
    console.log(imgPath)
    if(req.file){
        let {originalname,filename} = req.file;
        let ext = originalname.substring( originalname.indexOf("."));
        let oldPath = path.join( __dirname,"../","./uploads",filename);
        let newPath = path.join( __dirname,'../','./uploads',filename) + ext;
        imgPath = `uploads/${filename}${ext}`
        fs.renameSync(oldPath,newPath);
    }else{
        imgPath = oldImg;
    }
    let sql = `update library_content set
     title = '${title}',author= '${author}',picture='${imgPath}',cat_id= '${cat_id}',content= '${content}',audit= '${status}' where id = '${id}'`
    // let bind = [title,author,imgPath,cat_id,content,status,id];
    dbQuery(sql,(err,result)=>{
        if(result.affectedRows){
            if(req.file){
                let oldPath = path.join(__dirname,'../',oldImg);
                fs.unlink(oldPath,(err)=>{
                    console.log(oldPath)
                })
            }
            res.redirect('/');
        }else{
            res.send('<script>alert("编辑失败");location.href="/";</script>')
        }

    })
}

// 加入回收站
// ArticleController.recyclek = (req,res)=>{
//     let {id} = req.query;
//     let sql = "update library_content set if_recyclek = 0 where id = " + id;
//     dbQuery(sql,(err,result)=>{
//         let {affectedRows} = result;
//         if(affectedRows){
//             res.redirect("/");
//         }
//     })
// }


// ajax加入回收站
ArticleController.recyclek = (req,res) => {
    let {id} = req.body;
    let sql = "update library_content set if_recyclek = 0 where id = " + id;
    dbQuery(sql,(err,result)=>{
        if(result.affectedRows){
            res.json({
                code:20000,
                message: '加入成功'
            })
        }else {
            res.json({
                code:30004,
                message: '加入失败'
            })
        }
    })
}

// 回收站列表
ArticleController.recycleks = (req,res)=> {
    let userfoin = JSON.parse(req.session.userfoin || '');
    let sql = "select t1.*,t2.bookTitle from library_content as t1 left join library_classifys as t2 on t1.cat_id = t2.id where if_recyclek = 0 order by t1.id desc ;";
    dbQuery(sql,(err,rows)=>{
        let data = rows.map((item) => {
            item.audit = audits[item.audit];
            return item;
        })
        res.render("recycleks.html",{articles:data,userfoin});
    })
}

// 列表查看详情
ArticleController.detail = (req,res) => {
    let {id} = req.query;
    // let sql = `select * from library_content where id = ${id} `;
    let sql = `select t1.*,t2.bookTitle from library_content as t1 left join library_classifys as t2 on t1.cat_id = t2.id where t1.id = ${id};`
    dbQuery(sql,(err,rows)=>{
        let data = rows.map((item) => {
            
        })
        res.render("detail.html",{arrtiy:rows})
    })
}

// 获取分页的时候
ArticleController.articleCount = async (req,res) => {
    let {curr=1,limit=10} = req.query;

    // 查询文章总记录数
    let sql = `select count(*) as count from library_content where if_recyclek = 1`
    let Promise1 = dbQueryPromise(sql);
    let offset = (curr - 1) * limit;

    let sql2 = `select t1.*,t2.bookTitle from library_content as t1 
    left join library_classifys as t2 on t1.cat_id = t2.id 
    where if_recyclek = 1 order by t1.id desc limit ${offset},${limit};`
    let Promise2 = dbQueryPromise(sql2);
    let result = await Promise.all([Promise1,Promise2])
    res.json({
        count:result[0][0].count,
        data:result[1]
    })
}

module.exports = ArticleController;