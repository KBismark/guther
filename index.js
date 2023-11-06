
const { update } = require('guther/lib/update');
const { get } = require('guther/lib/get');
const { remove } = require('guther/lib/remove');
const { set_db_path } = require('guther/lib/_global');

 let db_path_set = false;
 let guther = {
    update:update, get:get,
    insert:update, remove:remove,
    set_dir(dir){
       if(!db_path_set&&typeof dir!=='string') return;
       set_db_path(dir);
       db_path_set = true;
    }
};
 guther = Object.create(guther);
 module.exports = guther;
