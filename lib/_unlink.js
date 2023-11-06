
const {unlink} = require('fs');
const { executeCallbacks, handleErrors,read_activity,write_activity } = require('guther/lib/_global');

function _unlink(path){
	return new Promise((resolve,reject)=>{
		if(remove_activity.has(path)){
			remove_activity.get(path)
			.push({resolve,reject});
			return;
		}
		
		remove_activity.set(path,[{resolve,reject}]);
		
		if(read_activity.has(path)||write_activity.has(path)){
			return;
		}
		
		unlink(path,(err)=>{
			const callbacks = remove_activity.get(path);
			remove_activity.delete(path);
			
			const read_callbacks = read_activity.get(path)
			if(read_callbacks){
				read_activity.delete(path);
				_readFile(path).then((data)=>{
					executeCallbacks(read_callbacks,data);
				}).catch((err)=>{
					handleErrors(err,read_callbacks);
				})
			}
			if(err) {
				handleErrors(err,callbacks);
				return;
			}
			executeCallbacks(callbacks,true);
		})
	})
}

module.exports = {_unlink}
