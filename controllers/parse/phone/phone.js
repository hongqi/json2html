var path = require('path');
var Base = require('../base/base');
var cheerio = require('cheerio');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');


var Phone = function(model, events) {
	Base.call(this, model, events);

	var dom = fs.readFileSync(path.resolve(__dirname, './phone.html')).toString();
	this.tpl = this.htmlReg.exec(dom)[1];
	this.reqSrc = "";
	
	if(this.jsReg.exec(dom)) {
		this.reqSrc = this.jsReg.exec(dom)[1];
	} 

	this.$ = cheerio.load(this.tpl);
	this.$el = this.$('.piece');

	if(!this.value.telnum) {
		this.sendError(__line, 402, "phone 链接参数为空!");
		return;
	}

	if(!this.value.width) {
		this.sendError(__line, 402, "phone 宽度参数为空!");
		return;
	}

	this.telnum = this.value.telnum;
	this.width = this.value.width;

	this.init = function() {
		this.$telBtn = this.$el.find('.tel-btn');

		this.$telBtn.css({
			width: this.width + "%"
		});
		
		this.$telBtn.attr('href', 'tel:'+ this.telnum);
	};

	this.getHtml = function() {
		return this.$.html();
	};

};


module.exports = Phone;



