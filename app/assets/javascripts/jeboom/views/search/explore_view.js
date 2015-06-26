var ExploreView = BaseView.extend({
	render : function (id) {
		var iframe = $('<iframe>', {
			src: "http://108.175.161.106/#dimension=category&id=" + id + "&keyword=", 
			id: 'explore-iframe', 
			style: 'width:100%; height:850px; padding-top:40px;',
			align: "center", 
			seamless: true}).text("Your browser doesn't support floating frames!");
		this.$el.prepend(iframe);
	},

	remove : function () {
		this.$("iframe").remove();
	}
});