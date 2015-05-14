var events = require('events');
var EventEmitter = events.EventEmitter;

events = {
	init: function() {
		this.event = new EventEmitter();
		return this;
	},
	on: function(event_name, handler) {
		this.event.on(event_name, handler);
	},
	emit: function(event_name, obj) {
		console.log("event "+event_name+" emit at:"+ __filename + ":" + __line + "\ndata:"+ JSON.stringify(obj));
		this.event.emit(event_name, obj);
	}
}

module.exports = events;