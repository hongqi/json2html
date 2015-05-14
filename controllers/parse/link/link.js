var path = require('path');
var Base = require('../base/base');
var cheerio = require('cheerio');
var _ = require('underscore');
var $;

var Link = function(model, events) {
	Base.call(this, model, events);

	this.tpl = [
		'<div class="piece">',
			'<a target="_blank" class="link"></a>',
		'</div>'
	].join('');
	
	$ = cheerio.load(this.tpl);
	this.$el = $('.piece');

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
		console.log("class Link init");
		this.$link = this.$el.find('.link');
		this.$link.attr('href', this.url);
		this.$link.html(this.name);

		return this;
	};

	this.getHtml = function() {
		return $.html();
	};

};

module.exports = Link;



