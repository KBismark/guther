
const {readFile} = require('fs');
const { executeCallbacks, handleErrors, read_activity, remove_activity } = require('guther/lib/_global');

function _readFile(path){
	return new Promise((resolve,reject)=>{
		if(read_activity.has(path)){
			read_activity.get(path)
			.push({resolve,reject});
			return;
		}
		
		read_activity.set(path,[{resolve,reject}]);
		
		if(remove_activity.has(path)){
			return;
		}
		
		readFile(path,'utf8',(err,data)=>{
			const callbacks = read_activity.get(path);
			read_activity.delete(path);
			const remove_callbacks = remove_activity.get(path)
			if(remove_callbacks){
				remove_activity.delete(path);
				_unlink(path).then(()=>{
					executeCallbacks(remove_callbacks,true);
				}).catch((err)=>{
					handleErrors(err,remove_callbacks);
				})
			}
			if(err) {
				handleErrors(err,callbacks);
				return;
			}
			executeCallbacks(callbacks,data);
		})
	})
}

module.exports = {_readFile};
