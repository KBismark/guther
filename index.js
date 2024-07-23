
const { update } = require('./lib/update');
const { get } = require('./lib/get');
const { remove } = require('./lib/remove');
const { set_db_path } = require('./lib/_global');

 let db_path_set = false;
 let guther = {
    update:update, get:get,
    insert: async({id,data})=>{
      let ex= null;
     try {
      ex = await get({id});
     } catch (error) {}
     if(!ex){
      return await update({id,data})
     }
     throw new Error('Not inserted');
    }, 
    remove:remove,
    set_dir(dir){
       if(!db_path_set&&typeof dir!=='string') return;
       set_db_path(dir);
       db_path_set = true;
    }
};
 guther = Object.create(guther);
 module.exports = guther;
