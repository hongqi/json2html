var image = require('./image/image.js');
var phone = require('./phone/phone.js');
var text = require('./text/text.js');
var link = require('./link/link.js');

var List = {
	"image": image,
	"phone": phone,
	"text": text,
	"link": link
};

var Manifest = {
	get: function(name) {
		return List[name];
	}
}

module.exports = Manifest;