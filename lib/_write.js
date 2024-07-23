
const {writeFile} = require('fs');
const { handleErrors, executeCallbacks, remove_activity, write_activity } = require('../lib/_global');
const {_unlink} = require('../lib/_unlink')

function _writeFile(path,data){
	return new Promise((resolve,reject)=>{
		write_activity.set(path,true);
		writeFile(path,data,(err)=>{
			write_activity.delete(path);
			const remove_callbacks = remove_activity.get(path)
			if(remove_callbacks){
				remove_activity.delete(path);
				_unlink(path).then(()=>{
					executeCallbacks(remove_callbacks,true);
				}).catch((err)=>{
					handleErrors(err,remove_callbacks);
				})
			}
			if(err) return reject(err);
			resolve(1);
		})
	})
}


module.exports = {_writeFile}
