
const { update } = require('./lib/update');
const { get } = require('./lib/get');
const { remove } = require('./lib/remove');
const { set_db_path } = require('./lib/_global');

 let db_path_set = false;
 let guther = {
    update:update, get:get,
    /**
     * @param {{data: {[k:string]:any}, id: string}} param0
     */
    async insert({id,data}){
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
    /**
     * Set the directory for storing data
     * @param {string} dir
     */
    set_db_dirictory(dir){
       if(db_path_set||typeof dir!=='string') return;
       set_db_path(dir, true);
       db_path_set = true;
    }
};
 module.exports = Object.create(guther);
