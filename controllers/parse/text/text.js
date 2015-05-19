var path = require('path');
var Base = require('../base/base');
var cheerio = require('cheerio');
var _ = require('underscore');

var Text = function(model, events) {
	Base.call(this, model, events);
	this.tpl = [
		'<div class="piece">',
			'<div class="rich-text"></div>',
		'</div>'
	].join('');

	this.$ = cheerio.load(this.tpl);
	this.$el = this.$('.rich-text');
	if(!this.value.text) {
		this.sendError(__line, 402, "text 文本参数为空!");
		return;
	}

	console.log(__filename+":"+__line+": "+ JSON.stringify(model));
	this.init = function(){
		this.$el.append(this.value.text);

		return this;
	};

	this.getHtml = function(){
		return this.$.html();
	};
};

module.exports = Text;



