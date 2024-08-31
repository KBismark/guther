const path = require('path')
const { executeCallbacks, handleErrors, documentIsBusy, get_db_dir} = require("../lib/_global");
const { _readFile } = require("../lib/_read");

const pending_gets = new Map();
/**
 * 
 * @param {{id: string}} param0 
 */
function get({id}){
    return new Promise(async (resolve,reject)=>{
        id = `./${id}.json`;
        if(pending_gets.has(id)){
           pending_gets.get(id).push({resolve,reject});
            return;
        }
        
        pending_gets.set(id,[{resolve,reject}])
        
        // if file is busy, add to pendings
        if(documentIsBusy(id)){
            return;
        }
        
        // the path to document
        const data_path = path.join(get_db_dir(),id);
        // load the document into memory if exists
        let db_data = null;
        try{
            db_data = await _readFile(data_path);
            db_data = JSON.parse(db_data);
        }catch(err){
            let callbacks = pending_gets.get(id);
            if(callbacks){
                pending_gets.delete(id);
            }else{
                callbacks = [];
            }
           
            reject(err);
            handleErrors(err,callbacks)
            return;
        }
        
       // document is busy only when updating,
       // serve current request
       if(documentIsBusy(id)){
           resolve(db_data);
           return;
       }
        let callbacks = pending_gets.get(id);
        if(callbacks){
            pending_gets.delete(id);
        }else{
            callbacks = [];
       }
        
       resolve(db_data);
        executeCallbacks(callbacks,db_data);
    })
}



module.exports = {get,pending_gets}
