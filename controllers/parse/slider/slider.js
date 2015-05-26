var path = require('path');
var Base = require('../base/base');
var cheerio = require('cheerio');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');


var Slider = function(model, events) {
	Base.call(this, model, events);

	var dom = fs.readFileSync(path.resolve(__dirname, './slider.html')).toString();
	var itemDom = fs.readFileSync(path.resolve(__dirname, './item.html')).toString();

	this.tpl = this.htmlReg.exec(dom)[1];
	this.itemTpl = this.htmlReg.exec(itemDom)[1];
	this.reqSrc = "";
	
	if(this.jsReg.exec(dom)) {
		this.reqSrc = this.jsReg.exec(dom)[1];
	} 

	this.$ = cheerio.load(this.tpl);
	this.$el = this.$('.piece');

	if(!this.value.imgs || !this.value.imgs.length) {
		this.sendLog(JSON.stringify(this.value.imgs));
		this.sendError(__line, 402, "slider imgs参数为空!");
		return;
	}

	if(!this.value.auto) {
		this.sendLog("slider 自动播放参数为空", __line);
	}

	this.imgs = [].concat(this.value.imgs);
	this.auto = this.value.auto;

	this.init = function() {
		this.sendLog("slider init", __line);

		this.$container = this.$el.find('.slide-container');

		this.$sliderWrap = this.$container.find('.slide-wrap');
		this.$cnt = this.$container.find('.slide-cnt');

		if(this.reqSrc) {
			var reg = /\{%auto%\}/;
			this.reqSrc = this.reqSrc.replace(reg, this.auto);
		}
		this.imgLength = this.imgs.length;

		var i = 0, item, that = this;

		for(;i < this.imgLength; i ++) {
			var $$ = cheerio.load(this.itemTpl);
			var $img = $$('img');
			$$('.silde-item').attr("data-index", i);
			
			$img.attr('src', that.imgs[i]);

			that.$sliderWrap.append($$.html());
			that.$cnt.append('<span></span>');
		}

		return this;
	};

	this.getHtml = function() {
		return this.$.html();
	};

};

module.exports = Slider;



