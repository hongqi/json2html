var logHelper = require('./tetris_log/logHelper').helper;

var logger = {
	init: function(evt) {
		this.events = evt;
		this.doEvent();
		return this;
	},
	doEvent: function() {
		this.events.on('onerror', function(data) {
			var msg = data.path + data.file + ":" + data.line + ":" + data.msg;
			logHelper.writeErr(msg);
		});

		this.events.on('oninfo', function(data) {
			var msg = data.path + data.file + ":" + data.line + ":" + data.msg;
			logHelper.writeInfo(msg);
		});

		this.events.on('onwarn', function(data) {
			var msg = data.path + data.file + ":" + data.line + ":" + data.msg;
			logHelper.writeWarn(msg);
		});

		this.events.on('ondebug', function(data) {
			var msg = data.path + data.file + ":" + data.line + ":" + data.msg;
			logHelper.writeDebug(msg);
		});
	}
}

module.exports = logger;