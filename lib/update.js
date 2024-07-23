const path = require('path')
const { documentIsBusy, setDocumentMode, handleErrors, executeCallbacks,get_db_dir } = require("../lib/_global");
const { _writeFile } = require('../lib/_write');
const { _readFile } = require('../lib/_read');
const { pending_gets } = require('../lib/get');

const pending_updates = new Map();
 
 function update({id,data}){
	 return new Promise(async (resolve,reject)=>{
		 id = `./${id}.json`;
		 // if file is busy, add to pendings
		 if(documentIsBusy(id)){
		 	if(!pending_updates.has(id)){
		 		pending_updates.set(id,{store:data,callbacks:[{resolve,reject}]})
		 		return;
		 	}
			// if there is a pending update for this document,
			// update the data in memory and add the callback
		 	const info = pending_updates.get(id);
		 	info.store = {...info.store,...data};
		 	info.callbacks.push({resolve,reject});
		 	return;
		 }
		 // set document mode to busy
		 setDocumentMode({id:id,busy:true});
		 // the path to document
		 const data_path = path.join(get_db_dir(),id);
		 // store a copy of current document data
		const db_data_copy = {err:null,data:null};
		 // load the document into memory if exists
		 let db_data = null;
		 try{
		 	db_data = await _readFile(data_path);
			db_data_copy.data = db_data = JSON.parse(db_data);
			
		 }catch(err){
			 // if error is other than "file not exist",
			 // send error response to all calbacks else
			 // treat as a new document to be inserted
			 if(err.code!=='ENOENT'){
				 setDocumentMode({id:id,busy:false});
				 let callbacks = [];
				 const info = pending_updates.get(id);
				 if(info){
				 	pending_updates.delete(id);
				 	callbacks = info.callbacks;
				 }
				// check for pending gets
				const pending_get_callbacks = pending_gets.get(id);
				// check if there are pending get requests.
				// if so, trigger a get event to serve all requests
				if(pending_get_callbacks){
					pending_gets.delete(id);
					handleErrors(err,pending_get_callbacks);
			 	}
				
				 reject(err);
				 handleErrors(err,callbacks)
				 return;
			 }
			 db_data_copy.err = err;
			 db_data = {};
	 	}
		
		// batch update data in memory
		let callbacks = [];
		let info = pending_updates.get(id);
		if(info){
			pending_updates.delete(id);
			db_data = {
				...db_data,
				...data,
				...info.store
			};
			callbacks = info.callbacks;
		}else{
			db_data = {
				...db_data,
				...data
			}
		}
		
		// write data 
		let write_err = false;
		try{
			await _writeFile(data_path,JSON.stringify(db_data))
		}catch(err){
			write_err = err;
		}
		// reset document mode
		 setDocumentMode({id:id,busy:false});
		// check for pending gets
		const pending_get_callbacks = pending_gets.get(id);
		// execute update callbacks
		if(write_err){
			// check if there are pending get requests.
			// if so, trigger a get event to serve all requests
			if(pending_get_callbacks){
				pending_gets.delete(id);
				// check if the file didn't exist during read
				if(db_data_copy.err){
					handleErrors(db_data_copy.err,pending_get_callbacks)
				}else{
					executeCallbacks(pending_get_callbacks,db_data_copy.data);
				}
			 }
			reject(err);
			handleErrors(write_err,callbacks)
		}else{
			// check if there are pending get requests.
			// if so, trigger a get event to serve all requests
			if(pending_get_callbacks){
			 	pending_gets.delete(id);
	 			executeCallbacks(pending_get_callbacks,db_data);
		 	}
			resolve(true);
			executeCallbacks(callbacks,true)
		}
		
		// if there were new update calls while we update,
		// those couldn't be batched together with the previous update.
		// issue for one new update call for all the pending updates
		info = pending_updates.get(id);
		if(info){
			pending_updates.delete(id);
			update({id:id,data:info.store})
			.then(()=>{
				executeCallbacks(info.callbacks,true);
			}).catch((err)=>{
				handleErrors(err,info.callbacks)
			})
		}
		
		
	})
 }



 module.exports = {update, pending_updates}
