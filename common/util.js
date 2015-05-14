var fs = require('fs');
var Q = require('q');
var stat = fs.stat;

var Util = {
	fsReadFile_deferd: function(file, encoding) {
		var deferred = Q.defer();
		encoding = encoding || "utf-8";
		fs.readFile(file,encoding,function(error,result){
			if(error){
				deferred.reject(error.toString().red);
			}
			deferred.resolve(result);
		});
		
		return deferred.promise;
	},
	writeFile_deferd: function(file,data) {
		var deferred = Q.defer();
		fs.writeFile(file, data, function(err) {
			if(err) {
				deferred.reject(err.toString());
			}
			deferred.resolve("saved success!");
		});

		return deferred.promise;
	},
	getID: function() {
		var S4 = function() {
		   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"_"+S4()+S4()+"_"+S4()+S4());
	},
	isType: function(data, type) {
		return Object.prototype.toString.call(data) == "[object "+type+"]";
	},
	doCopy: function(src, dst) {
        stat(src, function(err, st) {
            if(err) {
                throw err;
            }

            if(st.isFile()) {
                readable = fs.createReadStream(src);
                writable = fs.createWriteStream(dst);  
                readable.pipe(writable);
            } else if(st.isDirectory()) {
                fs.readdir( src, function( err, paths ){
                    if( err ){
                        throw err;
                    }
                    paths.forEach(function( path ){
                        var _src = src + '/' + path,
                            _dst = dst + '/' + path,
                            readable, writable;   

                        stat( _src, function( err, st ){
                            if( err ){
                                throw err;
                            }
                            if( st.isFile() ){
                                readable = fs.createReadStream( _src );
                                writable = fs.createWriteStream( _dst );  
                                readable.pipe( writable );
                            }
                            else if( st.isDirectory() ){
                                Util.exists( _src, _dst, Util.doCopy);
                            }
                        });
                    });
                });
            }
        });
    },
    exists: function(src, dst, callback) {
        fs.exists( dst, function( exists ){
            if( exists ){
                callback( src, dst );
            }
            else{
                fs.mkdir( dst, function(){
                    callback( src, dst );
                });
            }
        });    
    }
};

module.exports = Util;
