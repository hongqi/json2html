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
		this.config = stConfig.online;

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
			this.setTemplate(),
			this.addLibs(),
			this.doParse()
		]);

		promises.then(function(){
			that.addMD5(that.jsContainer);
			that.addMD5(that.cssContainer);

			that.renameStatic();
			that.assembleDom();

			that.deploy();
		},function(err){
			err = err || "服务器内部错误";
			this.sendError(__line, 502, err);
			return;
		});
	},
	setTemplate: function() {
		var deferred = Q.defer();
		var that = this;

		util.fsReadFile_deferd(templateMap[this.type]).then(function(result){
			$ = cheerio.load(result);
			deferred.resolve(result);
		}, function(err) {
			err = err ||  "服务器内部错误";
			deferred.reject(err);
			that.sendError(__line, 501, err);
		});

		return deferred.promise;
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
		
		var length = libArr.length, i = 0;
		for(; i < length; i++) {
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

			var readStr = fs.readFileSync(from);
			fs.writeFileSync(to, readStr);
		}

		deferred.resolve("addLibs");

		return deferred.promise;
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
		}
		
		deferred.resolve("doParse");
		return deferred.promise;
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

			var to = staticPath + item.name;
			var readStr = fs.readFileSync(item.path);
			fs.writeFileSync(to, readStr)
		}
		return;
	},
	addMD5: function(container) {
		var length = container.length,i = 0, obj;

		for(; i < length; i ++) {
			obj = container[i];
			var key = Object.keys(obj)[0];
			var val = obj[key];

			var sps = val.to.split('.');
			val.from = val.to;

			var md5;
			try {
				md5 = complie.md5(val.from).substring(0,7)
			} catch(err) {
				that.sendError(__line, 501, "服务器内部错误,添加MD5错误："+err);
				return;
			}

			val.to = sps[0] + "_" + md5 + "." + sps[1];
		}

		return;
	},
	renameStatic: function() {
		var arr = [].concat(this.jsContainer).concat(this.cssContainer);
		var length = arr.length, i = 0, item;
		for(;i < length; i ++) {
			item = arr[i];
			var key = Object.keys(item)[0];
			var val = item[key];
			fs.renameSync(val.from, val.to);
		}
		return;
	},
	assembleDom: function() {
		this.$head = $('head');
		this.$body = $('#content');
		this.$footer = $('#footer');

		var domain = this.config.domain,
			that = this;

		var headScript = '',
			headCss = '',
			footerScript = '';

		this.jsContainer.forEach(function(ele, idx) {
			var key = Object.keys(ele)[0];
			var val = ele[key];
			var modPath =  val.to.substring(val.to.indexOf('static/') + 7);

			if(val.isLib) {
				var scpt = '<script type="text/javascript" charset="utf-8" src="'+domain+'/'+modPath+'"></script>';
				headScript += scpt 
			} else {
				var scpt = '<script type="text/javascript" charset="utf-8" src="'+domain+'/'+modPath+'"></script>';
				footerScript += scpt;
			}
		});

		this.cssContainer.forEach(function(ele, idx) {
			var key = Object.keys(ele)[0];
			var val = ele[key];
			var modPath =  val.to.substring(val.to.indexOf('static/') + 7);

			var css = '<link rel="stylesheet" type="text/css" href="'+domain+'/'+modPath+'">';
			headCss += css;
		});	

		parse.parseFac.forEach(function(ele, idx) {
			that.$body.append(ele.getHtml());
		});

		parse.requireHolder.forEach(function(ele, idx) {
			footerScript += '<script type="text/javascript">' + ele + '</script>';
		});

		this.$head.append(headScript);
		this.$head.append(headCss);
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