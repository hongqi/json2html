var manifest = require("./manifest");
var _ = require('underscore');
var util = require("../../common/util");
var path = require('path');
var fs = require('fs');
var config = require('./config');

var siteMap = config.site;

var eleMap = config.ele;

var parseMap = config.parse;

var Parse = {
	init: function(response, model, site, events) {
		this.response = response;
		this.events = events;
		this.site = site;

		this.sendLog("parse init", __line);
		this.mapFileter = {};
		this.jsHolder = [];
		this.cssHolder = [];
		this.requireHolder = [];
		this.staticHolder = [];
		this.TreeArr = [];

		this.createTree(model[siteMap[site]], 'root');

		this.parseFac = [];
		this.doParse();

		return this;
	},
	doParse: function() {
		var that = this;

		this.sendLog("parse doParse", __line);
		var arr = [].concat(this.TreeArr);
		var length = arr.length;

		if(length < 1) {
			this.sendError(__line, 502, "服务器内部解析错误!");
			return;
		}

		for(var i = 0; i < length; i++) {
			var item = arr[i],
				Brick = manifest.get(item.label);

			if(!Brick) {
				this.sendError(__line, 502, "插件" + item.name + "正在开发中。。。");
				return;
			}

			var jsPath = this._getFile(item.label, 'js'),
				cssPath = this._getFile(item.label, 'css');


			this.pushJs(jsPath, item.label);
			this.pushCss(cssPath, item.label);
			
			var brick = new Brick(item, that.events);
				brick.init();

			this.pushRequire(brick.reqSrc);

			this.parseFac.push(brick);
		}

		return;
	},
	pushJs: function(jsPath, label) {
		if(!jsPath) {
			return;
		}

		if(this.mapFileter[jsPath]) {
			return;
		}
		this.mapFileter[jsPath] = true;

		var obj = {};

		obj.path = jsPath;
		obj.name = "_" + label + '.js';

		this.jsHolder.push(obj);
	},
	pushCss: function(cssPath, label) {
		if(!cssPath) {
			return;
		}

		if(this.mapFileter[cssPath]) {
			return;
		}
		this.mapFileter[cssPath] = true;

		var obj = {};

		obj.path = cssPath;
		obj.name = label + '.css';
				
		this.cssHolder.push(obj);
	},
	pushRequire: function(src) {
		if(!src) {
			return;
		}
		if(this.mapFileter[src]) {
			return;
		}
		this.mapFileter[src] = true;

		this.requireHolder.push(src);
	},
	createTree: function(data, pid) {
		if(!data || !data.length) {
			this.sendError(__line, 402, "数据为空");
			return;
		}

		var i, length = data.length,
			that = this;

		for(i = 0; i < length; i++) {
			var item = data[i],
				ele = that._adapterObj(item);

			ele.pid = pid;
			ele.id = util.getID();
			ele.label = parseMap[ele.name];

			this.TreeArr.push(ele);

			if(item.subitems && item.subitems.length) {
				that.createTree(item.subitems, ele.id);
			}
		}
	},
	_getFile: function(name, type) {
		var filename;
		if(type == 'js') {
			filename = __dirname + "/" + name + "/" +"_"+name + ".js";
		} else if(type == 'css') {
			filename = __dirname + "/" + name + "/" + name + ".css";
		}

		if(fs.existsSync(filename)) {
			return filename;
		}
		return false;
	},
	_adapterObj: function(data) {
		var map = eleMap[this.site];
		var obj = {};
		for(var key in map){
			obj[key] = data[key] || "";
		}
		return obj;
	},
	sendError: function(lineNum, code, msg){
		this.sendLog(msg, lineNum, "error");
		var obj = {
			path: __dirname,
			file: __filename,
			line: lineNum, 
			msg: msg
		};
		this.events.emit('onerror', obj);
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

module.exports = Parse;