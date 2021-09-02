const express = require("express"); //加载express框架
const mysql = require("mysql"); // 加载连接数据库
const fs = require("fs");
const path = require("path");


const artTemplate = require("art-template"); // 加载静态模板插件
const express_template = require("express-art-template"); // 
const multer = require("multer");
const app = express();

app.use("/uploads",express.static(__dirname + "/uploads"));

const upload = multer({dest:"uploads/"}) //设置上传的目录，会自动创建
// 配置模板引擎
app.set("views",__dirname + "/views/");
app.engine("html",express_template);
app.set("view engine","html")

app.use(express.json());
app.use(express.urlencoded({extended:true}));

var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "root",
    database: "library"
})

connection.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("连接到MYSQL")
})

let audits = {
    0:"待审核",
    1:"审核通过",
    2:"审核失败"
}

// 文章列表
app.get("/",(req,res)=> {
    let sql = "select t1.*,t2.bookTitle from library_content as t1 left join library_classifys as t2 on t1.cat_id = t2.id where if_recyclek = 1 order by t1.id desc ;";
    connection.query(sql,(err,rows)=>{
        let data = rows.map((item) => {
            item.audit = audits[item.audit];
            return item;
        })
        res.render("index.html",{articles:data});
    })
})

// 文章添加
app.get("/add",(req,res)=> {
    let sql = "select * from library_classifys";
    connection.query(sql,(err,rows)=>{
        res.render("add.html",{classif:rows})
    })
})

app.post("/insert",upload.single("picture"),(req,res)=>{
    // console.log(req.body);
    // console.log(req.file);
    let imgPath = '';
    if(req.file){
        let {originalname,filename,destination} = req.file;
        let ext = originalname.substring( originalname.indexOf("."));
        let oldPath = path.join(__dirname,destination,filename);
        let newPath = path.join(__dirname,destination,filename) + ext;
        imgPath = `${destination}${filename}${ext}`;
        fs.renameSync(oldPath,newPath);
    
    }
    let {title,author,id,content} = req.body;
    let sql = "insert into library_content(title,author,cat_id,content,picture) values (?,?,?,?,?)";
    let bind = [title,author,id,content,imgPath];
    connection.query(sql,bind,(err,result)=>{
        if(result.affectedRows){
            res.send("<script>alert('添加成功');location.href='/';</script>")
        }else{
            res.send("<script>alert('添加失败');location.href='/';</script>")
        }
    })
})

// 文章删除 
app.get("/delete",(req,res)=>{
    let {id,picture} = req.query;
    let sql = `delete from library_content where id = ${id}`;
    connection.query(sql,(err,result)=>{
        if(result.affectedRows){
            if(picture){
                let oldpath = path.join(__dirname,picture);
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
})


// 文章编辑回显
app.get("/edit",(req,res)=>{
    let {id} = req.query;

    let sql1 = `select * from library_content where id = ${id}`;
    connection.query(sql1,(err,rows1)=>{
        let sql2 = "select * from library_classifys";
        connection.query(sql2,(err,rows2)=>{
            res.render("edit.html",{article:rows1[0],cats:rows2})
        })
    })
})

// 文章编辑更新
app.post("/update",upload.single("picture"),(req,res)=>{
    let {id,title,author,content,status,cat_id,oldImg} = req.body;
    console.log(oldImg);
    console.log(req.file)
    let imgPath;
    if(req.file){
        console.log(req.file);
        let {originalname,filename} = req.file;
        let ext = originalname.substring( originalname.indexOf("."));
        let oldPath = path.join( __dirname,'uploads',filename);
        let newPath = path.join( __dirname,'uploads',filename) + ext;
        imgPath = `uploads/${filename}${ext}`
        fs.renameSync(oldPath,newPath);
    }else{
        imgPath = oldImg;
    }
    let sql = `update library_content set title = ?,author= ?,picture=?,cat_id= ?,content= ?,audit= ? where id = ?`
    let bind = [title,author,imgPath,cat_id,content,status,id];
    connection.query(sql,bind,(err,result)=>{
        if(result.affectedRows){
            if(req.file){
                let oldPath = path.join(__dirname,oldImg);
                fs.unlink(oldPath,(err)=>{

                })
            }
            res.redirect('/');
        }else{
            res.send('<script>alert("编辑失败");location.href="/";</script>')
        }

    })
})

// 加入回收站
app.get("/recyclek",(req,res)=>{
    let {id} = req.query;
    let sql = "update library_content set if_recyclek = 0 where id = " + id;
    connection.query(sql,(err,result)=>{
        let {affectedRows} = result;
        if(affectedRows){
            res.redirect("/");
        }
    })
})

// 回收站列表
app.get("/recycleks",(req,res)=> {
    let sql = "select t1.*,t2.bookTitle from library_content as t1 left join library_classifys as t2 on t1.cat_id = t2.id where if_recyclek = 0 order by t1.id desc ;";
    connection.query(sql,(err,rows)=>{
        let data = rows.map((item) => {
            item.audit = audits[item.audit];
            return item;
        })
        res.render("recycleks.html",{articles:data});
    })
})

app.listen(4000,()=>{
    console.log("server is running at port 4000");
});