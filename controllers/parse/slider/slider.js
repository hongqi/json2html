var path = require('path');
var Base = require('../base/base');
var cheerio = require('cheerio');
var _ = require('underscore');

var Slider = function(model, events) {
	Base.call(this, model, events);

	this.tpl = [
		'<div class="piece">',
			'<div class="slide-container">',
				'<div id="slider">',
					'<div class="slide-wrap"></div>'
				'</div>',
				'<div class="slide-cnt"></div>'
			'</div>',
		'</div>'
	].join('');

	this.itemTpl = [
		
	].join('');
	
	this.$ = cheerio.load(this.tpl);
	this.$el = this.$('.piece');

	if(!this.value.imgs || !this.value.imgs.length) {
		this.sendError(__line, 402, "slider imgs参数为空!");
		return;
	}

	if(!this.value.auto) {
		this.sendLog("slider 自动播放参数为空");
	}

	this.imgs = [].concat(this.value.imgs);
	this.auto = this.value.auto

	this.init = function() {
		this.$container = this.$el.find('.slide-container');

		this.$slider = this.$container.find('#slider');
		this.$cnt = this.$container.find('.slide-cnt');
		return this;
	};

	this.getHtml = function() {
		return this.$.html();
	};

};

module.exports = Slider;



