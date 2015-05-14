var events = require('events');
var EventEmitter = events.EventEmitter;
var _ = require('underscore');
var util = require('../common/util');

Json = {
	init: function() {
		this.event = new EventEmitter();
		this.store = [];
		return this;
	},
	storeData: function(col, data) {
		if(!util.isType(data, 'Object')) {
			console.log(__filename + ':'+ __line + ': '+ "数据不是对象类型");
			return false;
		}

		data.id = util.getID();
		var obj = {};
		obj.col = col;
		obj.data = _.extend({}, data);
		this.store.push(obj);
		return true;
	},
	getDataByCol: function(col) {
		var length = this.store.length;
		var result = [];

		for(var i = 0; i < length; i ++) {
			var item = this.store[i];
			if(item.col == col) {
				result.push(item);
			}
		}

		return result;
	}, 
	getDataById: function(id) {
		var length = this.store.length;

		for(var i = 0; i < length; i ++) {
			var item = this.store[i];
			if(item && item.data && item.data.id == id) {
				return item;
			}
		}
		return false;
	},
	removeData: function(id) {
		var length = this.store.length;

		for(var i = 0; i < length; i ++) {
			var item = this.store[i];
			if(item && item.data && item.data.id == id) {
				this.store.splice(i, 1);
			}
		}
	},
	removeCol: function(col) {
		var length = this.store.length;

		for(var i = 0; i < length; i ++) {
			if(this.store[i].col == col) {
				this.store.splice(i, 1);
			}
		}
	}
};

module.exports = Json;