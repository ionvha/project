const dbQueryPromise = require('../model/query-promise');

const indexController = {};

indexController.index = (req,res) => {
    let userfoin = JSON.parse(req.session.userfoin || '');
    res.render("index.html",{userfoin})
}

indexController.cateArticleCount = async (req,res) => {
    let sql = `SELECT
            t2.bookTitle,count(t1.cat_id) as count
        FROM
        library_content t1
        LEFT JOIN library_classifys t2 ON t1.cat_id = t2.id
        GROUP BY
            t1.cat_id;`;
    let result = await dbQueryPromise(sql)
    res.json(result)
}

module.exports = indexController;
