var path = require('path');
var Base = require('../base/base');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');

var Floor = function(model, events) {
	Base.call(this, model, events);
	
	var dom = fs.readFileSync(path.resolve(__dirname, './floor.html')).toString();
	this.tpl = this.htmlReg.exec(dom)[1];
	this.reqSrc = "";
	
	if(this.jsReg.exec(dom)) {
		this.reqSrc = this.jsReg.exec(dom)[1];
	} 

	this.$ = cheerio.load(this.tpl);
	this.$el = this.$('.floor-space');
	if(!this.value.height) {
		this.sendError(__line, 402, "floor 高度参数为空!");
		return;
	}

	this.init = function(){
		var height = this.value.height || 1;
		this.$el.css({
			height: height
		})
		return this;
	};

	this.getHtml = function(){
		return this.$.html();
	};
};

module.exports = Floor;



