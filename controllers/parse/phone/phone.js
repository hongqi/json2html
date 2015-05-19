var path = require('path');
var Base = require('../base/base');
var cheerio = require('cheerio');
var _ = require('underscore');

var Phone = function(model, events) {
	Base.call(this, model, events);

	this.tpl = [
		'<div class="piece">',
			'<a class="tel-btn"><i class="phone-icon"></i>立即拨打</a>',
		'</div>'
	].join('');

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



