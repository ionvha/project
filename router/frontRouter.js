const express = require('express');

const router = express.Router();

const query = require('../model/query-promise.js');

// 获取分类数据
router.get('/cate', async (req,res) => {
    let sql = 'select * from library_classifys where whethers = 1';
    let result = await query(sql);
    res.json(result);
})

// 获取全部文章
router.get('/article',async (req,res) => {
    let {page=1,pagesize=3} = req.query;
    let offset = (page -1) * pagesize;
    let sql = `select t1.*,t2.bookTitle from library_content t1 left join library_classifys t2 
        on t1.cat_id = t2.id 
        where t1.if_recyclek = 1 and t1.audit = 1 limit ${offset} , ${pagesize}`
        let result = await query(sql);
        res.json(result);
    })

// 获取分类的文章
router.get('/detail', async (req,res) => {
    let {id} = req.query;
    let sql = `select * from library_content as t1 left join 
    library_classifys as t2 on t1.cat_id = t2.id 
    where t1.id = ${id}`;
    let result = await query(sql);
    res.json(result[0])
})

// 获取分类的所有文章
router.get('/cates', async (req,res) => {
    let {cat_id,page,pagesize} = req.query;
    let offset = (page -1) * pagesize;
    let sql = `select * from library_content as t1 left join 
    library_classifys as t2 on t1.cat_id = t2.id 
    where t1.cat_id = ${cat_id} limit ${offset},${pagesize}` ;
    let result = await query(sql);
    res.json(result)
})

router.get('*', (req,res) => {
    res.json({messsage:'404'})
})


module.exports = router;
