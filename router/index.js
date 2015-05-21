var express = require('express');
var path = require('path');
var router = express.Router();
var util = require('../common/util');
var events = require('../events').init();
var logger = require('../logger').init(events);
var json2html = require('../controllers/json2html');
var model = require('../models/json').init();

var sendLog = function(info, line, type) {
	type = type || "info";
	console.log(__filename + ":"+ line + ": "+ type + "----" + info);
};

var sendParseErr = function(err, lineNum) {
	err = err || "数据解析失败";
	sendLog(err, lineNum, "error");

	var obj = {
		path: __dirname,
		file: __filename,
		line: lineNum,
		msg: err,
	};

	events.emit("onerror", obj);
};

router.post('/json2html', function(req, res, next){
	sendLog(req.body, __line);

	var result = req.body.data;
	var type = req.body.type || "webpage";
	var col = req.body.col || util.getID();
	var site = req.body.site || "ad";

	if(util.isType(result, "String")) {
		try {
			result = JSON.parse(result);
		}catch(err) {
			sendParseErr(err, __line);
			res.send({
				status_code: 302,
				msg: err
			});
			res.end();
		}
	} 

	sendLog(result, __line);
	// start adapter data

	model.storeData(col, result);
	json2html.init(res, col, site, type);

});

router.get('/json2html/:file', function(req, res, next) {
	if(!req.params.file) {
		sendLog("file is emtpy!");
		res.send({
			status_code: 401,
			msg: "文件名是空！"
		});
		res.end();
	}
	var filename = '../test/' + req.params.file + '.json';
		filename = path.resolve(__dirname, filename);
		
	sendLog(filename, __line);
	util.fsReadFile_deferd(filename).then(function(result) {
		sendLog(util.isType(result, "String"), __line);
		if(util.isType(result, "String")) {
			try{	
				result = JSON.parse(result);
			}catch(err) {
				sendParseErr(err, __line);
				res.send({
					status_code: 302,
					msg: err
				});
				res.end();
			}
		}
		sendLog(result, __line);

		var col = util.getID();
		var flag = model.storeData(col, result);
		
		if(!flag) {
			sendLog("存储数据错误!", __line, "error");
			return;
		}		
		
		json2html.init(res, col, "ad", "webpage", true);
 		// start adapter data

	}, function(err) {
		err = err || "文件读取错误或者文件不存在";
		sendLog(err, __line, "error");

		var obj = {
			path: __dirname,
			file: __filename,
			line: __line,
			msg: err
		};

		events.emit('onerror', obj);

		res.send({
			status_code: 302,
			msg: err
		});
		res.end();
	});
});

router.get('/preview/:file', function(req, res, next) {
  res.render(req.params.file);
});


module.exports = router;