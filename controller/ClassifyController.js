const mysql = require('mysql');
const dbQuery = require('../model/query.js')
const dbQueryPromise = require('../model/query-promise.js')
const moment = require('moment');
const {getNowDate,dateFormat} = require('../util/tool.js')

const ClassifyController = {};

// 分类列表
// ClassifyController.classify = (req,res) => {
//     let userfoin = JSON.parse(req.session.userfoin || '');
//     let sql = 'select * from library_classifys';
//     dbQuery(sql,(err,rows)=>{
//         // let data = rows.map((item) => {
//         //     item.audit = audits[item.audit];
//         //     return item;
//         res.render('classify.html',{userfoin,classify:rows})
//     })
// }

// ClassifyController.classify = (req,res) => {
//     let userfoin = JSON.parse(req.session.userfoin || '');
//     let sql = 'select * from library_classifys';
//     dbQueryPromise(sql).then(rows => {
//         res.render('classify.html',{userfoin,classify:rows})
//     })
// }

// 分类列表
ClassifyController.classify = (req,res) => {
    let userfoin = JSON.parse(req.session.userfoin || '');
    res.render('classify.html',{userfoin});
}

// 分类列表数据 
ClassifyController.classifyData = (req,res) => {
    let sql = `select * from library_classifys order by id desc`;

    dbQueryPromise(sql).then(result => {
        result.forEach(item => {
            item['updataTime'] = dateFormat( item['updataTime'] );
            item['addTime'] = dateFormat(item['addTime'],'YYYY-MM-DD')
        })
        res.json(result)
    })
}
// 添加分类列表
ClassifyController.classifyAdd = (req,res) => { 
    let userfoin = JSON.parse(req.session.userfoin || '{}');
    res.render('classifyAdd.html',{userfoin});
}

// 添加分类操作
ClassifyController.classifyInsert = (req,res) => {
    console.log(req.body)
    let {bookTitle,whethers} = req.body;
    let sql = `select * from library_classifys where bookTitle = '${bookTitle}'`;
    dbQueryPromise(sql).then(result => {
        if(result.length){
            res.json({
                message: '分类名被占用',
                code: -1
            })
        }else{
            let updataTime = function getNowDate(format="YYYY-MM-DD HH:mm:ss"){
                return moment().format(format); 
            }()
            let sql = `insert into library_classifys(bookTitle,whethers,updataTime) value ('${bookTitle}','${whethers}','${updataTime}')`;
            dbQueryPromise(sql).then(result => {
                if(result.affectedRows){
                    res.json({
                        message: '添加成功',
                        code: 20000
                    })
                }
            })
        }
    })
}

// ajax删除
ClassifyController.classifydelete = (req,res) => {
    let {id} = req.body;
    let sql = `delete from library_classifys where id = ${id}`
    dbQueryPromise(sql).then(result => {
        res.json({
            code: 20000,
            message: '成功'
        })
    }).catch(error => {
        res.json({
            code: -1,
            message: '失败'
        })
    })
}

module.exports = ClassifyController