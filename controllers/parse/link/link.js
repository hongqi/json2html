var path = require('path');
var Base = require('../base/base');
var cheerio = require('cheerio');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');


var Link = function(model, events) {
	Base.call(this, model, events);

	var dom = fs.readFileSync(path.resolve(__dirname, './link.html')).toString();
	this.tpl = this.htmlReg.exec(dom)[1];
	this.reqSrc = "";
	
	if(this.jsReg.exec(dom)) {
		this.reqSrc = this.jsReg.exec(dom)[1];
	} 

	this.$ = cheerio.load(this.tpl);
	this.$el = this.$('.piece');

	if(!this.value.url) {
		this.sendError(__line, 402, "link 链接参数为空!");
		return;
	}

	if(!this.value.name) {
		this.sendError(__line, 402, "link 名称为空!");
		return;
	}

	this.url = this.value.url;
	this.name = this.value.name;

	this.init = function() {
		this.$link = this.$el.find('.link');
		this.$link.attr('href', this.url);
		this.$link.html(this.name);

		return this;
	};

	this.getHtml = function() {
		return this.$.html();
	};

};

module.exports = Link;



