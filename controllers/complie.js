var util = require('../common/util');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Q = require('q');

var complie = {
	addDefine: function(id, content) {
		return 'define("'+id+'", function(require, exports, module){\n'+content+'\n});'
	},
	doPackage: function(source, pkg) {
		if(!source.length){
			throw new Error("源文件为空!");
			return;
		}

		if(!path.isAbsolute(pkg)) {
			throw new Error("不是绝对路径!");
			return;
		}

		var parseObj = path.parse(pkg);
		var length = source.length;
		for(var i = 0; i < length; i++) {
			var file = source[i];
			if(!fs.existsSync(file)) {
				throw new Error(file+"文件不存在!");
				return;
			}
			
			var readable = fs.createReadStream(file);

		}
	},
	md5: function(filename) {
		return crypto.createHash('sha1').update(fs.readFileSync(filename)).digest('hex');
	}
};

module.exports = complie;