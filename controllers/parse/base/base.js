
var Base = function(model, events) {
	this.jsReg = /\{%script%\}((.|\n)*?)\{%\/script%\}/;
	this.htmlReg = /\{%block%\}((.|\n)*?)\{%\/block%\}/;

	this.model = model;
	this.name = model.name;
	this.type = model.type;
	this.value = model.value;
	this.id = model.id;
	this.label = model.label;
	this.pid = model.pid || "";
	this.events = events;

	this.style = model.style || "";
	this.animation = model.animation || "";


	this.init = function() {
		return this;
	};

	this.getJsPath = function() {
		return "";
	};

	this.getHtml = function() {
		return "";
	};

	this.getModel = function() {
		return this.model;
	};

	this.getLabel = function() {
		return this.label;
	};

	this.getRequire = function() {
		return "";
	};

	this.sendError = function(lineNum, code, msg){
		this.sendLog(msg, lineNum, "error");
		var obj = {
			path: __dirname,
			file: __filename,
			line: lineNum, 
			msg: msg
		};
		this.events.emit('onerror', obj);
	};

	this.sendLog = function(info, line, type) {
		type = type || "info";
		console.log(__filename + ":"+ line + ": "+ type + "----" + info);
	};
};

module.exports = Base;