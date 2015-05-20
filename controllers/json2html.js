var model = require('../models/json');
var util = require('../common/util');
var parse = require('./parse/parse');
var complie = require('./complie');
var colors = require('colors');

var stConfig = require('./config');
var cheerio = require('cheerio');
var Q = require('q');
var path = require('path');
var fs = require('fs');

var events = require('../events').init();
var logger = require('../logger').init(events);

var libDir = path.join(__dirname, "lib");
var $;
var templateMap = {
	webpage: path.join(__dirname, "templates/webpage.html"),
	webapp: path.join(__dirname, "templates/webapp.html")
};

var json2html = {
	init: function(response, col, site, type, isPreview) {
		this.sendLog("json2html init", __line);
		this.response = response;
		this.isPreview = isPreview;
		this.site = site;
		this.type = type;
		this.config = stConfig.dev;

		this.jsContainer = [];
		this.cssContainer = [];
		this.requireContainer = [];
		this.defineMap = {};

		var that = this;

		this.staticDir = path.join(__dirname, "static");
		

		this.data = [].concat(model.getDataByCol(col));
		this.sendLog(JSON.stringify(this.data), __line);

		if(!this.data.length) {
			this.sendError(__line, 401, "获取的数据为空");
			return;
		}
		
		var promises = Q.all([
			util.fsReadFile_deferd(templateMap[type]).then(function(result){
				$ = cheerio.load(result);
			}, function(err) {
				err = err || "服务器内部错误";
				that.sendError(__line, 501, err);
				return;
			}),
			this.addLibs(),
			this.doParse()
		]);

		// this.ct = 0;
		// promises.then(function(res){
		// 	this.ct ++;
		// 	that.postStatic();
		// 	that.sendLog(JSON.stringify(that.staticArr), __line);

		// 	that.addDefine();
		// 	that.doCombine();

		// 	that.deploy();
		// }, function(err){
		// 	that.sendError(__line, 501, "服务器内部错误");
		// })
	},
	postStatic: function(){
		// css 去重
		this.sendLog(JSON.stringify(this.cssContainer), __line);
		var length = this.cssContainer.length;
		var map = {};
		var temp = [];
		var that = this;
		for(var i = 0; i < length; i++) {
			var cssItem = this.cssContainer[i];
			for(var o in cssItem) {
				var val = cssItem[o];
				if(map[val.from+val.to]) {
					that.sendLog(val.from, __line);
					// temp.splice(i, 1);
				}else {
					map[val.from+val.to] = true;
					temp.push(cssItem);
				}
			}
		}
		this.cssContainer = [].concat(temp);
		this.sendLog(JSON.stringify(this.cssContainer), __line);
		
		var arr = [].concat(this.jsContainer).concat(this.cssContainer);
		this.sendLog(JSON.stringify(arr), __line);
		var len = arr.length;
		var that = this;
		var dMap = {};

		for(var i = 0; i < len; i++) {
			var item = arr[i];
			for(var o in item) {
				var val = item[o];
				var sps = val.to.split('.');
				val.from = val.to;
				if(dMap[val.from]) {
					continue;
				}
				dMap[val.from] = true;
				var md5;

				try {
					md5 = complie.md5(val.from).substring(0,7)
				} catch(err) {
					that.sendError(__line, 501, "服务器内部错误："+err);
				}
				val.to = sps[0] + "_" + md5 + "." + sps[1];

				that.sendLog(JSON.stringify(val), __line)
				util.doCopy(val.from, val.to);
			}
		}
		this.staticArr = [].concat(arr);		
	},
	addDefine: function(){
		this.sendLog("addDefine", __line);

		var length = this.staticArr.length;
		var that = this;

		for(var i = 0; i < length; i++) {
			var item = this.staticArr[i];
			for(var o in item) {
				var val = item[o];
				if(val.type == "js" && !val.isLib) {
					if(that.defineMap[val.to]) {
						continue;
					}
					that.defineMap[val.to] = true;

					var content = fs.readFileSync(val.from).toString();
					var id = "tetris/parse/"+ o;

					var defineContent = complie.addDefine(id, content);

					that.sendLog(val.to, __line);
					that.sendLog(defineContent, __line);

					fs.writeFileSync(val.to, defineContent);
					console.log(fs.readFileSync(val.to).toString())
				}
			}
		}
		return;
	},
	doCombine: function(){
		this.$head = $('head');
		this.$body = $('#content');
		this.$footer = $('#footer');


		var domain = this.config.domain,
			length = this.staticArr.length;

		var headScript = '',
			headCss = '',
			footerScript = '';

		for(var i = 0; i < length; i++) {
			var item = this.staticArr[i];
			for(var o in item) {
				var val = item[o];
				var modPath =  val.to.substring(val.to.indexOf('static/') + 7);

				if(val.type == "js" && val.isLib) {
					var scpt = '<script type="text/javascript" charset="utf-8" src="'+domain+'/'+modPath+'"></script>';
					headScript += scpt;
				} else if(val.type == "js" && !val.isLib) {
					if(this.defineMap[modPath]) {
						continue;
					}
					this.defineMap[modPath] = true;
					var scpt = '<script type="text/javascript" charset="utf-8" src="'+domain+'/'+modPath+'"></script>';
					footerScript += scpt
				} else if(val.type == "css") {
					var css = '<link rel="stylesheet" type="text/css" href="'+domain+'/'+modPath+'">';
					headCss += css;
				}
			}
		}

		console.log(JSON.stringify(this.requireContainer));
		this.$head.append(headScript);
		this.$head.append(headCss);

		var len = parse.parseFac.length;
		for(var i = 0; i < len; i++) {
			var brick = parse.parseFac[i];
			this.$body.append(brick.getHtml());
		}

		this.$footer.append(footerScript);
		return;
	},
	deploy: function(){
		var dpObj = this.config.deploy,
			that = this;
		var from = path.resolve(__dirname, dpObj.from),
			to = path.resolve(__dirname, dpObj.to);

		util.exists(from, to, util.doCopy);

		if(this.isPreview) {
			var views = path.resolve(__dirname, "../views");
			var file = util.getID();
			var filename = views + "/"+file+".html";

			util.writeFile_deferd(filename, $.html()).then(function(rst){
				that.response.redirect('/preview/'+ file);
				that.response.end();
			}, function(err){
				that.sendError(__line, 501, "保存文件错误");
			})
		} else {
			this.response.send({
				html: $.html()
			});
			this.response.end();
		}
		return;
	},
	doParse: function() {
		var length = this.data.length;
		var that = this;
		var deferred = Q.defer();

		this.mkDir("parse");

		var staticPath = that.staticDir + "/parse/";
		for(var i = 0; i < length; i++) {
			parse.init(this.response, this.data[i].data, this.site, events);
			that.moveToStatic(parse.jsHolder, that.jsContainer, staticPath, "js");
			that.moveToStatic(parse.cssHolder, that.cssContainer, staticPath, "css");
			that.moveRequire(parse.requireHolder);
		}
		
		deferred.resolve("doParse");
		return deferred.promise;
	},
	moveRequire: function(holder) {
		if(!holder || !holder.length) {
			return;
		}

		var i = 0, item,
			that = this,
			length = holder.length,
			requireMap = {};

		for(; i < length; i ++) {
			item = holder[i];
			if(requireMap[item.id]) {
				continue;
			}
			requireMap[item.id] = true;
			that.requireContainer.push(item);
		}
		return;
	},
	moveToStatic: function(holder, container, staticPath, tp) {
		var holders = [].concat(holder);
		var length = holders.length;
		var that = this;

		for(var i = 0; i < length; i++) {
			var item = holders[i];
			var obj = {};
			obj[item.name] = {
				type: tp,
				from: item.path,
				to: staticPath + item.name
			};

			container.push(obj);

			util.doCopy(item.path, staticPath + item.name);
		}
	},
	mkDir: function(dir) {
		this.sendLog(dir, __line);
		var stDir = this.staticDir +"/"+ dir;
		
		fs.exists(stDir, function(exists){
			if(exists){
				return;
			} else {
				fs.mkdirSync(stDir); 
			}
		})
	},
	addLibs: function(){
		var that = this;
		var libArr = [];
		var deferred = Q.defer();

		var result = this.config;
		var libs = result.libs;
		libArr = libArr.concat(libs.common)
						.concat(libs[that.type])
						.concat(libs.options);

		that.mkDir('lib');

		var libPath = that.staticDir + '/lib/';
		that.doAddLibs(libArr, libPath);
		deferred.resolve("addLibs");

		return deferred.promise;
	},
	doAddLibs: function(libArr, libPath) {
		if(!libArr.length) {
			return;
		}
		var length = libArr.length;
		var that = this;
		for(var i = 0; i < length; i++) {
			var file = libArr[i] + '.js';
			var from = libDir +"/"+ file;
			var to = libPath + file;

			var obj = {};
			obj[file] = {
				type: "js",
				isLib: true,
				from: from,
				to: to
			};
			that.jsContainer.push(obj);

			that.sendLog(JSON.stringify(obj),__line);
			util.doCopy(from, to);
		}
		return;
	},
	sendError: function(lineNum, code, msg){
		this.sendLog(msg, lineNum, "error");
		var obj = {
			path: __dirname,
			file: __filename,
			line: lineNum, 
			msg: msg
		};
		events.emit('onerror', obj);
		this.response.send({
			status_code: code,
			msg: msg
		});
		this.response.end();
	},
	sendLog: function(info, line, type) {
		type = type || "info";
		console.log(__filename + ":"+ line + ": "+ type + "----" + info);
	}
};

module.exports = json2html;