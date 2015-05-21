var path = require('path');
var Base = require('../base/base');
var cheerio = require('cheerio');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var Text = function(model, events) {
	Base.call(this, model, events);
	
	var dom = fs.readFileSync(path.resolve(__dirname, './text.html')).toString();
	this.tpl = this.htmlReg.exec(dom)[1];
	this.reqSrc = "";
	
	if(this.jsReg.exec(dom)) {
		this.reqSrc = this.jsReg.exec(dom)[1];
	} 

	this.$ = cheerio.load(this.tpl);
	this.$el = this.$('.rich-text');
	if(!this.value.text) {
		this.sendError(__line, 402, "text 文本参数为空!");
		return;
	}

	this.init = function(){
		this.$el.append(this.value.text);

		return this;
	};

	this.getHtml = function(){
		return this.$.html();
	};
};

module.exports = Text;



