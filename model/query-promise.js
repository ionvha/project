// 连接数据库
const mysql = require('mysql');
const dbConfig = require('../config/dbconfig.js')
const connection = mysql.createConnection(dbConfig);

//连接mysql
connection.connect(function(err){
    if(err){
        throw err;
    }
    console.log('connect mysql success');
});

function dbQuery(sql){
    return new Promise((resolve,rejcet)=>{
        connection.query(sql,function(err,result){
            if(err){
                rejcet(err);
            }else {
                resolve(result);
            }
        })
    })
}

// 暴露于模块
module.exports = dbQuery;
