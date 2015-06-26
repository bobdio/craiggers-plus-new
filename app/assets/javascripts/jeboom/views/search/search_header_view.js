var SearchHeaderView = BaseView.extend({
	template : JST['search_header'],

	events : {
		"click .logo a" : "logoHandler",
		"click #favorites-link" : "gotoFavorites",
		"click #search-link" : "gotoSearch",
		"click #explore-link" : "gotoExplore"
	},

	render : function () {
		this.$el.prepend(this.template({
			version : app.version
		}));

		this.container = $("#navbar");
		this.container.show();

		this.signinout = new SigninOutView();
		this.signinout.render(this.container);
	},

	selectLink : function (link) {
		this.container.find("#header .navlink.active").removeClass("active");
		link.addClass("active");
	},

	gotoExplore : function () {
		router.navigate("#!/explore", {trigger: true});
	},

	gotoFavorites : function () {
		router.gotoFavorites();
	},

	activateSearch : function () {
		this.selectLink(this.container.find("#search-link"));
	},

	activateFavorites : function () {
		this.selectLink(this.container.find("#favorites-link"));
	},

	activateExplore : function () {
		this.selectLink(this.container.find("#explore-link"));
	},

	isFavoritesSelected : function () {
		return this.container.find("#favorites-link").hasClass('active');
	},

	gotoSearch : function () {
		router.gotoSearch();
	},

	logoHandler : function (event) {
		router.gotoMain();
	},

	remove : function () {
		this.container.remove();
		this.signinout.remove();

		this.undelegateEvents(this.events);
	}
});