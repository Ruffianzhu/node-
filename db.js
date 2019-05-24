var MongoClient = require('mongodb').MongoClient;
function lianjie(callback) {
	var url = 'mongodb://localhost:27017';
	MongoClient.connect(url, function(err, db) {
		callback(err,db);
	})
}
exports.insert=function(dbname,collectionname,json,callback){
	lianjie(function(err,db){
		if(err){
			callback(err,db);
			return;
		}
		var col = db.db(dbname).collection(collectionname);
		col.insert(json,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}
exports.find=function(dbname,collectionname,json,callback,args){
	var arr=[];
	if(arguments.length==4){
		var a=0;
		var b=0;
	}else{
		var a=parseInt(args.a);
		var b=parseInt(args.b)*a;
	}
	lianjie(function(err,db){
		if(err){
			callback(err,db,0);
			return;
		}
		var col = db.db(dbname).collection(collectionname);
		var num;
		col.find(json).count(function(err,result){
			num=result;
		});
		var cursor=col.find(json).limit(a).skip(b).sort({"shijian":-1});      //limit限制最大数目，skip略过信息数
		cursor.each(function(err,doc){
			if(err){
				callback(err,null,0);
				return;
			}
			if(doc!=null){
				arr.push(doc);
			}else{
				callback(null,arr,num);
			}
		})
	})
}
exports.delete=function(dbname,collectionname,json,callback){
	lianjie(function(err,db){
		if(err){
			callback(err,db);
			return;
		}
		var col = db.db(dbname).collection(collectionname);
		col.deleteMany(json,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}
exports.update=function(dbname,collectionname,json1,json2,callback){
	lianjie(function(err,db){
		if(err){
			callback(err,db);
			return;
		}
		var col = db.db(dbname).collection(collectionname);
		col.updateMany(json1,json2,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}
