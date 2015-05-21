var image = require('./image/image');
var phone = require('./phone/phone');
var text = require('./text/text');
var link = require('./link/link');
var floor = require('./floor/floor');

var List = {
	"image": image,
	"phone": phone,
	"text": text,
	"link": link,
	"floor": floor
};

var Manifest = {
	get: function(name) {
		return List[name];
	}
}

module.exports = Manifest;