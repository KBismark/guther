const { mkdirSync } = require('fs');
const path = require('path')

// path to database is stored here
let db_dir = '';
const activity = new Map();
const read_activity = new Map();
const remove_activity = new Map();
const write_activity = new Map();

 function setDocumentMode({id,busy}){
	busy?activity.set(id,true):
	activity.delete(id);
 }

 function documentIsBusy(id){
	 return activity.has(id)
 }
 function handleErrors(err,callbacks){
	for(let i=0,length=callbacks.length; i<length;i++){
		callbacks[i].reject(err);
	}
 }
 function executeCallbacks(callbacks,data){
	 data = data?data:true;
	for(let i=0,length=callbacks.length; i<length;i++){
		callbacks[i].resolve(data);
	}
 }

 const current_dir = path.join(__dirname);
 function set_db_path(dir,overide){
	if(overide){
	  return db_dir = dir;
	}
	return db_dir = path.join(current_dir,dir);
 }

 // Create default db directory
 try {
	mkdirSync(set_db_path('../db'))
 } catch (error) {
	if(error.code !== 'EEXIST'){
		throw error;
	}
 }
 function get_db_dir(){ return db_dir}
 module.exports = {
    setDocumentMode,documentIsBusy,handleErrors,executeCallbacks,set_db_path,
	read_activity,remove_activity,write_activity, get_db_dir
 }
