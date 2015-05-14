var cheerio = require('cheerio');
var Base = require('../base/base');
var cheerio = require('cheerio');
var $;

var Image = function(model, events) {
	Base.call(this, model, events);

	this.tpl = [
		'<div class="piece">',
			'<a target="_blank" class="image-link">',
				'<img class="image-item">',
			'</a>',
		'</div>'
	].join('');

	$ = cheerio.load(this.tpl);
	this.$el = $('.piece');

	if(!this.value.link) {
		this.sendError(__line, 402, "image 链接参数为空!");
	}

	if(!this.value.imgsrc) {
		this.sendError(__line, 402, "image 图片地址为空!");
		return;
	}

	this.link = this.value.link;
	this.imgSrc = this.value.imgsrc;

	this.init =function(){
		this.sendLog("brick image init", __line);

		this.$link = this.$el.find('a');
		this.$img = this.$el.find('.image-item');

		this.$link.attr('href', (this.link || "javascript:void(0);"));
		this.$img.attr('src', this.imgSrc);

		return this;
	};

	this.getHtml = function() {
		return $.html();
	};

};

module.exports = Image;



