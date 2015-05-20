var Image = {
	init: function(el) {
		this.$el = $(el);
		this.$link = this.$el.find('.image-link');

		this.$link.bind('click', function(evt) {
			console.log("image link click");
		})
	}
}

module.exports = Image;