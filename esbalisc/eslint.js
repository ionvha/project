const chokidar = require('chokidar');
const execSh = require('exec-sh');

chokidar.watch('./').on('all',(event,path) => {
    if(event === 'change'){
        execSh(`npx eslint ${path} --fix`,function(err){
            if(err) {
                console.log('error',err.code);
            }
        })
    }
})