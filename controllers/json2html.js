var model = require('../models/json');
var util = require('../common/util');
var parse = require('./parse/parse');
var complie = require('./complie');

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
		this.jsContainer = [];
		this.cssContainer = [];

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

		promises.then(function(res){
			that.postStatic();
			that.sendLog(JSON.stringify(that.staticArr), __line);

			that.addDefine();
			that.doCombine();

			that.deploy();
		}, function(err){
			that.sendError(__line, 501, "服务器内部错误");
		})
	},
	postStatic: function(){
		// css 去重
		var length = this.cssContainer.length;
		var map = {};
		var temp = [].concat(this.cssContainer);
		for(var i = 0; i < length; i++) {
			var cssItem = this.cssContainer[i];
			for(var o in cssItem) {
				var val = cssItem[o];
				if(map[val.from+val.to]) {
					temp.splice(i, 1);
				}else {
					map[val.from+val.to] = true;
				}
			}
		}
		this.cssContainer = [].concat(temp);
		
		var arr = [].concat(this.jsContainer).concat(this.cssContainer);
		var len = arr.length;
		var that = this;

		for(var i = 0; i < len; i++) {
			var item = arr[i];
			for(var o in item) {
				var val = item[o];
				var sps = val.to.split('.');
				val.from = val.to;
				val.to = sps[0] + "_" + complie.md5(val.from).substring(0,7) + "." + sps[1];
				fs.renameSync(val.from, val.to);
				that.sendLog(val, __line)
			}
		}
		this.staticArr = [].concat(arr);		
	},
	addDefine: function(){
		this.sendLog("addDefine", __line);

		var length = this.staticArr.length;
		for(var i = 0; i < length; i++) {
			var item = this.staticArr[i];
			for(var o in item) {
				var val = item[o];
				if(val.type == "js" && !val.isLib) {
					var content = fs.readFileSync(val.to).toString();
					var id = "tetris/parse/"+ o;
					fs.writeFileSync(val.to, complie.addDefine(id, content));
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
					var scpt = '<script type="text/javascript" charset="utf-8" src="'+domain+'/'+modPath+'"></script>';
					footerScript += scpt
				} else if(val.type == "css") {
					var css = '<link rel="stylesheet" type="text/css" href="'+domain+'/'+modPath+'">';
					headCss += css;
				}
			}
		}

		this.$head.append(headScript);
		this.$head.append(headCss);
		this.$footer.append(footerScript);


		var len = parse.parseFac.length;
		for(var i = 0; i < len; i++) {
			var brick = parse.parseFac[i];
			this.$body.append(brick.getHtml());
		}

		this.sendLog($.html(), __line);
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

		this.mkDir("parse");

		var staticPath = that.staticDir + "/parse/";
		for(var i = 0; i < length; i++) {
			parse.init(this.response, this.data[i].data, this.site, events);
			that.moveToStatic(parse.jsHolder, that.jsContainer, staticPath, "js");
			that.moveToStatic(parse.cssHolder, that.cssContainer, staticPath, "css");
		}
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
		this.readConfig().then(function(result){
			var libs = result.libs;
			libArr = libArr.concat(libs.common)
							.concat(libs[that.type])
							.concat(libs.options);

			that.mkDir('lib');

			var libPath = that.staticDir + '/lib/';
			that.doAddLibs(libArr, libPath);
			deferred.resolve("addLibs");
		});

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

			util.doCopy(from, to);
		}
		return;
	},
	readConfig: function(){
		var that = this;
		var deferred = Q.defer();
		if(this.config && Object.keys(this.config).length) {
			deferred.resolve(this.config);
			return deferred.promise;
		}

		util.fsReadFile_deferd(path.join(__dirname,"config.json")).then(function(result){
			if(util.isType(result, "String")) {
				try{
					result = JSON.parse(result);
				}catch(err) {
					err = err || "数据解析错误";
					that.sendLog(err, __line, "error");
				}
			}
			that.config = result;
			deferred.resolve(result);
		}, function(err){
			that.sendError(__line, 501, "服务器内部错误");
			deferred.reject(err);
		});

		return deferred.promise;
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