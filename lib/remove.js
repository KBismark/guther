const { executeCallbacks, handleErrors,  get_db_dir} = require("../lib/_global");
const { _unlink } = require("../lib/_unlink");




const pending_removes = new Map();
 
function remove({id}){
    return new Promise(async (resolve,reject)=>{
       id = `./${id}.json`;
       if(pending_removes.has(id)){
           pending_removes.get(id).push({resolve,reject});
            return;
       }
       pending_removes.set(id,[{resolve,reject}])
        // the path to document
        const data_path = path.join(get_db_dir(),id);
        try{
           await _unlink(data_path);
        }catch(err){
           if(err.code!=='ENOENT'){
               let callbacks = pending_removes.get(id);
               pending_removes.delete(id);
                handleErrors(err,callbacks)
                return;
           }
           
       }
       
       let callbacks = pending_removes.get(id);
       pending_removes.delete(id);
       executeCallbacks(callbacks,true);
       
    })
}

module.exports = {remove,pending_removes}
